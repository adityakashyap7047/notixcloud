export interface CloudProvider {
  id: string;
  name: string;
  type: "oracle" | "hetzner" | "vultr";
  apiKey?: string;
  apiSecret?: string;
  region?: string;
  compartmentId?: string;
  sshKeyId?: string;
}

export interface CloudInstance {
  id: string;
  name: string;
  ip: string;
  status: "PROVISIONING" | "RUNNING" | "STOPPED" | "TERMINATED";
  provider: string;
  region: string;
  ram: number;
  cpu: number;
  disk: number;
  createdAt: Date;
}

export interface ProvisionRequest {
  name: string;
  provider: "oracle" | "hetzner" | "vultr";
  region: string;
  ram: number;
  cpu: number;
  disk: number;
  sshPublicKey: string;
}

export interface ProvisionResponse {
  instanceId: string;
  ip: string;
  status: string;
  password?: string;
}
