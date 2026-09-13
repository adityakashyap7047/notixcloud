export interface HetznerConfig {
  apiToken: string;
}

export interface HetznerServer {
  id: number;
  name: string;
  status: string;
  publicNet: {
    ipv4: { ip: string };
    ipv6: { ip: string };
  };
  serverType: { name: string; memory: number; disk: number; cpus: number };
  datacenter: { name: string };
  created: string;
}

export class HetznerClient {
  private config: HetznerConfig;
  private apiHost = "api.hetzner.cloud";

  constructor(config: HetznerConfig) {
    this.config = config;
  }

  private async request(
    method: string,
    path: string,
    body: any = null
  ): Promise<any> {
    const url = `https://${this.apiHost}/v1${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiToken}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Hetzner API error (${response.status}): ${JSON.stringify(error)}`
      );
    }

    return response.json();
  }

  async listLocations(): Promise<any[]> {
    const result = await this.request("GET", "/locations");
    return result.locations || [];
  }

  async listServerTypes(): Promise<any[]> {
    const result = await this.request("GET", "/server_types");
    return result.server_types || [];
  }

  async listSSHKeys(): Promise<any[]> {
    const result = await this.request("GET", "/ssh_keys");
    return result.ssh_keys || [];
  }

  async createSSHKey(name: string, publicKey: string): Promise<number> {
    const result = await this.request("POST", "/ssh_keys", {
      name,
      public_key: publicKey,
    });
    return result.ssh_key.id;
  }

  async createServer(params: {
    name: string;
    type: string;
    location: string;
    image: string;
    sshKeys: number[];
    startAfterCreate: boolean;
    cloudInit?: string;
  }): Promise<HetznerServer> {
    const result = await this.request("POST", "/servers", {
      name: params.name,
      server_type: params.type,
      location: params.location,
      image: params.image,
      ssh_keys: params.sshKeys,
      start_after_create: params.startAfterCreate,
      user_data: params.cloudInit,
    });
    return result.server;
  }

  async getServer(serverId: number): Promise<HetznerServer> {
    const result = await this.request("GET", `/servers/${serverId}`);
    return result.server;
  }

  async deleteServer(serverId: number): Promise<void> {
    await this.request("DELETE", `/servers/${serverId}`);
  }

  async powerOnServer(serverId: number): Promise<void> {
    await this.request("POST", `/servers/${serverId}/actions/poweron`);
  }

  async powerOffServer(serverId: number): Promise<void> {
    await this.request("POST", `/servers/${serverId}/actions/poweroff`);
  }

  async resetServer(serverId: number): Promise<void> {
    await this.request("POST", `/servers/${serverId}/actions/reset`);
  }

  async listServers(): Promise<HetznerServer[]> {
    const result = await this.request("GET", "/servers");
    return result.servers || [];
  }

  getCloudInitScript(): string {
    return `#!/bin/bash
set -e

apt-get update -y
apt-get upgrade -y

curl -fsSL https://get.docker.com | sh
usermod -aG docker root

apt-get install -y jq curl wget

mkdir -p /opt/notixcloud
cd /opt/notixcloud

echo "Node setup complete" > /opt/notixcloud/status.txt
echo "$(date)" >> /opt/notixcloud/status.txt
`;
  }
}
