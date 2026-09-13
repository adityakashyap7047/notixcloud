import crypto from "crypto";

export interface OracleConfig {
  tenancyOcId: string;
  userId: string;
  fingerprint: string;
  privateKey: string;
  region: string;
  compartmentId: string;
}

export interface OracleInstance {
  id: string;
  displayName: string;
  state: string;
  shape: string;
  publicIp?: string;
  privateIp: string;
  timeCreated: string;
}

export class OracleCloudClient {
  private config: OracleConfig;
  private apiHost: string;

  constructor(config: OracleConfig) {
    this.config = config;
    this.apiHost = `iaas.${config.region}.oraclecloud.com`;
  }

  private signRequest(
    method: string,
    path: string,
    body: string = "",
    headers: Record<string, string> = {}
  ): Record<string, string> {
    const now = new Date();
    const dateStr = now.toUTCString();
    const contentLength = Buffer.byteLength(body).toString();

    const signingHeaders: Record<string, string> = {
      "(request-target)": `${method.toLowerCase()} ${path}`,
      host: this.apiHost,
      date: dateStr,
      "content-length": contentLength,
      "content-type": "application/json",
      ...headers,
    };

    const signingString = Object.keys(signingHeaders)
      .map((k) => `${k}: ${signingHeaders[k]}`)
      .join("\n");

    const signature = crypto
      .createSign("RSA-SHA256")
      .update(signingString)
      .sign(this.config.privateKey, "base64");

    const auth = `RSA-SHA256 keyId="${this.config.tenancyOcId}/${this.config.userId}/${this.config.fingerprint}",algorithm="rsa-sha256",headers="${Object.keys(signingHeaders).join(" ")}",signature="${signature}"`;

    return {
      Authorization: auth,
      date: dateStr,
      host: this.apiHost,
      "content-length": contentLength,
      "content-type": "application/json",
    };
  }

  private async request(
    method: string,
    path: string,
    body: any = null
  ): Promise<any> {
    const bodyStr = body ? JSON.stringify(body) : "";
    const headers = this.signRequest(method, path, bodyStr);

    const url = `https://${this.apiHost}${path}`;

    const response = await fetch(url, {
      method,
      headers,
      body: bodyStr || undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Oracle API error (${response.status}): ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async listShapes(): Promise<any[]> {
    const path = `/20160918/shapes?compartmentId=${this.config.compartmentId}`;
    const result = await this.request("GET", path);
    return result.items || [];
  }

  async listImages(shape: string = "VM.Standard.A1.Flex"): Promise<any[]> {
    const path = `/20160918/images?compartmentId=${this.config.compartmentId}&shape=${shape}&operatingSystem=Canonical Ubuntu&operatingSystemVersion=22.04&sortBy=timeCreated&sortOrder=DESC`;
    const result = await this.request("GET", path);
    return result.items || [];
  }

  async listVCNs(): Promise<any[]> {
    const path = `/20160918/vcns?compartmentId=${this.config.compartmentId}`;
    const result = await this.request("GET", path);
    return result.items || [];
  }

  async listSubnets(vcnId: string): Promise<any[]> {
    const path = `/20160918/subnets?compartmentId=${this.config.compartmentId}&vcnId=${vcnId}`;
    const result = await this.request("GET", path);
    return result.items || [];
  }

  async listSSHKeys(): Promise<any[]> {
    const path = `/20160918/sshkeys?compartmentId=${this.config.compartmentId}`;
    const result = await this.request("GET", path);
    return result.items || [];
  }

  async createInstance(params: {
    name: string;
    shape?: string;
    ocpus?: number;
    ramInGB?: number;
    diskInGB?: number;
    imageId: string;
    subnetId: string;
    sshPublicKey: string;
  }): Promise<OracleInstance> {
    const {
      name,
      shape = "VM.Standard.A1.Flex",
      ocpus = 4,
      ramInGB = 24,
      diskInGB = 200,
      imageId,
      subnetId,
      sshPublicKey,
    } = params;

    const launchDetails = {
      compartmentId: this.config.compartmentId,
      displayName: name,
      shape,
      shapeConfig: {
        ocpus,
        memoryInGBs: ramInGB,
      },
      sourceDetails: {
        sourceType: "image",
        imageId,
        bootVolumeSizeInGBs: diskInGB,
      },
      createVnicDetails: {
        subnetId,
        assignPublicIp: true,
      },
      metadata: {
        ssh_authorized_keys: sshPublicKey,
        user_data: Buffer.from(this.getCloudInitScript()).toString("base64"),
      },
    };

    const path = "/20160918/instances";
    const result = await this.request("POST", path, launchDetails);

    return {
      id: result.id,
      displayName: result.displayName,
      state: result.lifecycleState,
      shape: result.shape,
      privateIp: result.vnicAttachments?.[0]?.privateIp || "",
      timeCreated: result.timeCreated,
    };
  }

  async getInstance(instanceId: string): Promise<OracleInstance> {
    const path = `/20160918/instances/${instanceId}`;
    const result = await this.request("GET", path);

    let publicIp: string | undefined;
    try {
      const vnicPath = `/20160918/vnicAttachments?instanceId=${instanceId}`;
      const vnicResult = await this.request("GET", vnicPath);
      if (vnicResult.items?.length > 0) {
        const vnicId = vnicResult.items[0].vnicId;
        const ipPath = `/20160918/vnics/${vnicId}`;
        const ipResult = await this.request("GET", ipPath);
        publicIp = ipResult.publicIp;
      }
    } catch {
      // IP might not be assigned yet
    }

    return {
      id: result.id,
      displayName: result.displayName,
      state: result.lifecycleState,
      shape: result.shape,
      publicIp,
      privateIp: result.vnicAttachments?.[0]?.privateIp || "",
      timeCreated: result.timeCreated,
    };
  }

  async terminateInstance(instanceId: string): Promise<void> {
    const path = `/20160918/instances/${instanceId}`;
    await this.request("DELETE", path);
  }

  async startInstance(instanceId: string): Promise<void> {
    const path = `/20160918/instances/${instanceId}/action/start`;
    await this.request("POST", path, {});
  }

  async stopInstance(instanceId: string): Promise<void> {
    const path = `/20160918/instances/${instanceId}/action/stop`;
    await this.request("POST", path, {});
  }

  async listInstances(): Promise<OracleInstance[]> {
    const path = `/20160918/instances?compartmentId=${this.config.compartmentId}`;
    const result = await this.request("GET", path);
    return (result.items || []).map((item: any) => ({
      id: item.id,
      displayName: item.displayName,
      state: item.lifecycleState,
      shape: item.shape,
      publicIp: item.vnicAttachments?.[0]?.publicIp,
      privateIp: item.vnicAttachments?.[0]?.privateIp || "",
      timeCreated: item.timeCreated,
    }));
  }

  async setupNetwork(): Promise<{ subnetId: string; vcnId: string }> {
    let vcns = await this.listVCNs();
    let vcnId: string;

    if (vcns.length === 0) {
      const newVcn = await this.createVCN();
      vcnId = newVcn.id;
    } else {
      vcnId = vcns[0].id;
    }

    let subnets = await this.listSubnets(vcnId);
    let subnetId: string;

    if (subnets.length === 0) {
      const newSubnet = await this.createSubnet(vcnId);
      subnetId = newSubnet.id;
    } else {
      subnetId = subnets[0].id;
    }

    return { subnetId, vcnId };
  }

  private async createVCN(): Promise<any> {
    const body = {
      compartmentId: this.config.compartmentId,
      displayName: "notixcloud-vcn",
      cidrBlocks: ["10.0.0.0/16"],
    };
    const path = "/20160918/vcns";
    return this.request("POST", path, body);
  }

  private async createSubnet(vcnId: string): Promise<any> {
    const body = {
      compartmentId: this.config.compartmentId,
      vcnId,
      displayName: "notixcloud-subnet",
      cidrBlock: "10.0.1.0/24",
      waitForState: "AVAILABLE",
    };
    const path = "/20160918/subnets";
    return this.request("POST", path, body);
  }

  async getOrCreateSSHKey(name: string, publicKey: string): Promise<string> {
    const keys = await this.listSSHKeys();
    const existing = keys.find((k: any) => k.displayName === name);
    if (existing) return existing.id;

    const body = {
      compartmentId: this.config.compartmentId,
      displayName: name,
      publicKey,
    };
    const path = "/20160918/sshkeys";
    const result = await this.request("POST", path, body);
    return result.id;
  }

  private getCloudInitScript(): string {
    return `#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# Install dependencies
apt-get install -y jq curl

# Create working directory
mkdir -p /opt/notixcloud
cd /opt/notixcloud

# The node daemon will be pulled and started by the panel
echo "Node setup complete" > /opt/notixcloud/status.txt
echo "$(date)" >> /opt/notixcloud/status.txt
`;
  }
}
