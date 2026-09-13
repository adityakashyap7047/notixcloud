export interface VultrConfig {
  apiKey: string;
}

export interface VultrInstance {
  id: string;
  label: string;
  status: string;
  main_ip: string;
  region: string;
  plan: string;
  os: string;
  date_created: string;
}

export class VultrClient {
  private config: VultrConfig;
  private apiHost = "api.vultr.com";

  constructor(config: VultrConfig) {
    this.config = config;
  }

  private async request(
    method: string,
    path: string,
    body: any = null
  ): Promise<any> {
    const url = `https://${this.apiHost}/v2${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Vultr API error (${response.status}): ${error}`
      );
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async listPlans(): Promise<any[]> {
    const result = await this.request("GET", "/plans");
    return result.plans || [];
  }

  async listRegions(): Promise<any[]> {
    const result = await this.request("GET", "/regions");
    return result.regions || [];
  }

  async listOS(): Promise<any[]> {
    const result = await this.request("GET", "/os");
    return result.os || [];
  }

  async listSSHKeys(): Promise<any[]> {
    const result = await this.request("GET", "/ssh-keys");
    return result.ssh_keys || [];
  }

  async createSSHKey(label: string, publicKey: string): Promise<string> {
    const result = await this.request("POST", "/ssh-keys", {
      label,
      ssh_key: publicKey,
    });
    return result.ssh_key.id;
  }

  async createInstance(params: {
    label: string;
    region: string;
    plan: string;
    os_id: number;
    sshkey_id?: string[];
    script_id?: string;
    user_data?: string;
  }): Promise<VultrInstance> {
    const result = await this.request("POST", "/instances", {
      label: params.label,
      region: params.region,
      plan: params.plan,
      os_id: params.os_id,
      sshkey_id: params.sshkey_id,
      script_id: params.script_id,
      user_data: params.user_data
        ? Buffer.from(params.user_data).toString("base64")
        : undefined,
    });
    return result.instance;
  }

  async getInstance(instanceId: string): Promise<VultrInstance> {
    const result = await this.request("GET", `/instances/${instanceId}`);
    return result.instance;
  }

  async deleteInstance(instanceId: string): Promise<void> {
    await this.request("DELETE", `/instances/${instanceId}`);
  }

  async startInstance(instanceId: string): Promise<void> {
    await this.request("POST", `/instances/${instanceId}/start`);
  }

  async stopInstance(instanceId: string): Promise<void> {
    await this.request("POST", `/instances/${instanceId}/halt`);
  }

  async rebootInstance(instanceId: string): Promise<void> {
    await this.request("POST", `/instances/${instanceId}/reboot`);
  }

  async listInstances(): Promise<VultrInstance[]> {
    const result = await this.request("GET", "/instances");
    return result.instances || [];
  }

  getCloudInitScript(): string {
    return `#!/bin/bash
set -e

apt-get update -y
apt-get upgrade -y

curl -fsSL https://get.docker.com | sh

apt-get install -y jq curl wget

mkdir -p /opt/notixcloud
cd /opt/notixcloud

echo "Node setup complete" > /opt/notixcloud/status.txt
echo "$(date)" >> /opt/notixcloud/status.txt
`;
  }
}
