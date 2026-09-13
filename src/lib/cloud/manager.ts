import { OracleCloudClient, OracleConfig } from "./oracle";
import { HetznerClient, HetznerConfig } from "./hetzner";
import { VultrClient, VultrConfig } from "./vultr";
import { db } from "../db";

export type CloudProviderType = "oracle" | "hetzner" | "vultr";

export interface ProvisionNodeRequest {
  name: string;
  provider: CloudProviderType;
  credentials: Record<string, string>;
  region?: string;
  ram?: number;
  cpu?: number;
  disk?: number;
}

export interface ProvisionResult {
  instanceId: string;
  ip: string;
  status: string;
  nodeApiKey: string;
}

const NODE_DAEMON_SCRIPT = `#!/bin/bash
set -e

PANEL_URL="__PANEL_URL__"
NODE_API_KEY="__NODE_API_KEY__"
NODE_NAME="__NODE_NAME__"
NODE_IP="__NODE_IP__"
CHECK_INTERVAL=30

echo "=== NotixCloud Node Daemon ==="
echo "Panel: $PANEL_URL"
echo "Name: $NODE_NAME"

install_docker() {
    if command -v docker &> /dev/null; then
        echo "[OK] Docker installed"
        return
    fi
    echo "[*] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "[OK] Docker installed"
}

send_heartbeat() {
    local servers_data="[]"
    local running=$(docker ps --filter "label=notixcloud" --format "{{.Names}}" 2>/dev/null || echo "")

    if [ -n "$running" ]; then
        servers_data="["
        first=true
        while IFS= read -r c; do
            local sname="\${c#mc-}"
            local cid=$(docker inspect -f '{{.Id}}' "$c" 2>/dev/null || echo "")
            local st=$(docker inspect -f '{{.State.Status}}' "$c" 2>/dev/null || echo "unknown")
            local ds="RUNNING"
            case "$st" in
                exited|dead) ds="OFFLINE" ;;
                restarting) ds="STARTING" ;;
            esac
            if [ "$first" = true ]; then first=false; else servers_data+=","; fi
            servers_data+="{\"name\":\"\$sname\",\"containerId\":\"\$cid\",\"status\":\"\$ds\"}"
        done <<< "$running"
        servers_data+="]"
    fi

    curl -s -X POST \\
        -H "Authorization: Bearer $NODE_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d "{\\\"servers\\\":$servers_data,\\\"stats\\\":{\\\"cpu\\\":0,\\\"memory\\\":0,\\\"disk\\\":0}}" \\
        "$PANEL_URL/api/nodes/heartbeat" > /dev/null 2>&1 || true
}

monitor() {
    while true; do
        send_heartbeat

        local resp=$(curl -s -H "Authorization: Bearer $NODE_API_KEY" "$PANEL_URL/api/nodes/heartbeat" 2>/dev/null)
        echo "$resp" | jq -r '.servers[] | @json' 2>/dev/null | while read -r sj; do
            local sn=$(echo "$sj" | jq -r '.name')
            local act=$(echo "$sj" | jq -r '.action // empty')
            local ce=$(docker ps -a --filter "name=mc-$sn" --format "{{.Names}}" 2>/dev/null)

            case "$act" in
                create)
                    local ver=$(echo "$sj" | jq -r '.version // "1.20.4"')
                    local typ=$(echo "$sj" | jq -r '.type // "paper"')
                    local port=$(echo "$sj" | jq -r '.port // 25565')
                    local ram=$(echo "$sj" | jq -r '.allocatedRam // 2048')
                    if [ -z "$ce" ]; then
                        local img="itzg/minecraft-server:\$(echo $typ | tr '[:lower:]' '[:upper:]')"
                        docker run -d --name "mc-$sn" -e EULA=TRUE -e VERSION="$ver" -e TYPE="\$(echo $typ | tr '[:lower:]' '[:upper:]')" -e MEMORY="\${ram}M" -p "$port:25565" --memory="\${ram}m" --cpus="0.5" --label "notixcloud=true" --label "notixcloud.server=$sn" --restart unless-stopped -v "/opt/minecraft/data/$sn:/data" "$img"
                    fi
                    ;;
                start) [ -n "$ce" ] && docker start "mc-$sn" 2>/dev/null ;;
                stop) [ -n "$ce" ] && docker stop "mc-$sn" 2>/dev/null ;;
                restart) [ -n "$ce" ] && docker restart "mc-$sn" 2>/dev/null ;;
                delete) docker rm -f "mc-$sn" 2>/dev/null ;;
            esac
        done
        sleep $CHECK_INTERVAL
    done
}

install_docker
echo "[OK] Starting monitor..."
monitor
`;

export async function provisionNode(
  request: ProvisionNodeRequest
): Promise<ProvisionResult> {
  const nodeApiKey = `nx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  const panelUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  switch (request.provider) {
    case "oracle":
      return provisionOracle(request, nodeApiKey, panelUrl);
    case "hetzner":
      return provisionHetzner(request, nodeApiKey, panelUrl);
    case "vultr":
      return provisionVultr(request, nodeApiKey, panelUrl);
    default:
      throw new Error(`Unsupported provider: ${request.provider}`);
  }
}

async function provisionOracle(
  request: ProvisionNodeRequest,
  nodeApiKey: string,
  _panelUrl: string
): Promise<ProvisionResult> {
  const config: OracleConfig = {
    tenancyOcId: request.credentials.tenancyOcId || "",
    userId: request.credentials.userId || "",
    fingerprint: request.credentials.fingerprint || "",
    privateKey: request.credentials.privateKey || "",
    region: request.credentials.region || "us-ashburn-1",
    compartmentId: request.credentials.compartmentId || "",
  };

  const client = new OracleCloudClient(config);

  await client.setupNetwork();

  let ubuntuImage = "";
  try {
    const imageList = await client.listImages("VM.Standard.A1.Flex");
    if (imageList.length > 0) {
      ubuntuImage = imageList[0].id;
    }
  } catch {
    throw new Error("Could not find Ubuntu image. Please check your region.");
  }

  const sshPublicKey =
    request.credentials.sshPublicKey || "ssh-rsa AAAAB3...";

  const instance = await client.createInstance({
    name: request.name,
    ocpus: request.cpu || 4,
    ramInGB: Math.floor((request.ram || 8192) / 1024),
    diskInGB: Math.floor((request.disk || 50000) / 1000),
    imageId: ubuntuImage,
    subnetId: "",
    sshPublicKey,
  });

  let publicIp: string | undefined;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const updated = await client.getInstance(instance.id);
    if (updated.publicIp) {
      publicIp = updated.publicIp;
      break;
    }
  }

  if (!publicIp) {
    throw new Error("Instance created but public IP not yet available. Wait a moment and check Oracle Cloud console.");
  }

  await db.node.create({
    data: {
      name: request.name,
      ip: publicIp,
      port: 25565,
      daemonPort: 8443,
      apiKey: nodeApiKey,
      maxRam: request.ram || 8192,
      maxDisk: request.disk || 50000,
      maxCpu: request.cpu || 100,
      totalSlots: 50,
      status: "PROVISIONING",
    },
  });

  return {
    instanceId: instance.id,
    ip: publicIp,
    status: "PROVISIONING",
    nodeApiKey,
  };
}

async function provisionHetzner(
  request: ProvisionNodeRequest,
  nodeApiKey: string,
  panelUrl: string
): Promise<ProvisionResult> {
  const config: HetznerConfig = {
    apiToken: request.credentials.apiToken || "",
  };

  const client = new HetznerClient(config);

  let sshKeyId: number;
  const existingKeys = await client.listSSHKeys();
  const existing = existingKeys.find(
    (k: any) => k.name === `notixcloud-${request.name}`
  );
  if (existing) {
    sshKeyId = existing.id;
  } else {
    sshKeyId = await client.createSSHKey(
      `notixcloud-${request.name}`,
      request.credentials.sshPublicKey || ""
    );
  }

  const cloudInit = NODE_DAEMON_SCRIPT.replace(/__PANEL_URL__/g, panelUrl)
    .replace(/__NODE_API_KEY__/g, nodeApiKey)
    .replace(/__NODE_NAME__/g, request.name)
    .replace(/__NODE_IP__/g, "auto");

  const server = await client.createServer({
    name: request.name,
    type: "cax11",
    location: request.credentials.location || "fsn1",
    image: "ubuntu-22.04",
    sshKeys: [sshKeyId],
    startAfterCreate: true,
    cloudInit,
  });

  await db.node.create({
    data: {
      name: request.name,
      ip: server.publicNet.ipv4.ip,
      port: 25565,
      daemonPort: 8443,
      apiKey: nodeApiKey,
      maxRam: request.ram || 4096,
      maxDisk: request.disk || 40000,
      maxCpu: request.cpu || 100,
      totalSlots: 50,
      status: "PROVISIONING",
    },
  });

  return {
    instanceId: server.id.toString(),
    ip: server.publicNet.ipv4.ip,
    status: "PROVISIONING",
    nodeApiKey,
  };
}

async function provisionVultr(
  request: ProvisionNodeRequest,
  nodeApiKey: string,
  panelUrl: string
): Promise<ProvisionResult> {
  const config: VultrConfig = {
    apiKey: request.credentials.apiKey || "",
  };

  const client = new VultrClient(config);

  let sshKeyId: string;
  const existingKeys = await client.listSSHKeys();
  const existing = existingKeys.find(
    (k: any) => k.label === `notixcloud-${request.name}`
  );
  if (existing) {
    sshKeyId = existing.id;
  } else {
    sshKeyId = await client.createSSHKey(
      `notixcloud-${request.name}`,
      request.credentials.sshPublicKey || ""
    );
  }

  const cloudInit = NODE_DAEMON_SCRIPT.replace(/__PANEL_URL__/g, panelUrl)
    .replace(/__NODE_API_KEY__/g, nodeApiKey)
    .replace(/__NODE_NAME__/g, request.name)
    .replace(/__NODE_IP__/g, "auto");

  const instance = await client.createInstance({
    label: request.name,
    region: request.credentials.region || "ewr",
    plan: "vc2-1c-1gb",
    os_id: 387,
    sshkey_id: [sshKeyId],
    user_data: cloudInit,
  });

  await db.node.create({
    data: {
      name: request.name,
      ip: instance.main_ip,
      port: 25565,
      daemonPort: 8443,
      apiKey: nodeApiKey,
      maxRam: request.ram || 1024,
      maxDisk: request.disk || 25000,
      maxCpu: request.cpu || 100,
      totalSlots: 20,
      status: "PROVISIONING",
    },
  });

  return {
    instanceId: instance.id,
    ip: instance.main_ip,
    status: "PROVISIONING",
    nodeApiKey,
  };
}

export async function terminateNode(
  nodeId: string,
  provider: CloudProviderType,
  credentials: Record<string, string>,
  instanceId: string
): Promise<void> {
  switch (provider) {
    case "oracle": {
      const config: OracleConfig = {
        tenancyOcId: credentials.tenancyOcId || "",
        userId: credentials.userId || "",
        fingerprint: credentials.fingerprint || "",
        privateKey: credentials.privateKey || "",
        region: credentials.region || "us-ashburn-1",
        compartmentId: credentials.compartmentId || "",
      };
      const client = new OracleCloudClient(config);
      await client.terminateInstance(instanceId);
      break;
    }
    case "hetzner": {
      const config: HetznerConfig = { apiToken: credentials.apiToken || "" };
      const client = new HetznerClient(config);
      await client.deleteServer(parseInt(instanceId));
      break;
    }
    case "vultr": {
      const config: VultrConfig = { apiKey: credentials.apiKey || "" };
      const client = new VultrClient(config);
      await client.deleteInstance(instanceId);
      break;
    }
  }

  await db.node.delete({ where: { id: nodeId } });
}
