export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  balance: number;
  discordId: string | null;
  discordAvatar: string | null;
  createdAt: Date;
}

export interface Server {
  id: string;
  name: string;
  userId: string;
  nodeId: string;
  dockerContainerId: string | null;
  status: "OFFLINE" | "STARTING" | "RUNNING" | "STOPPING" | "ERROR";
  type: string;
  version: string;
  port: number;
  allocatedRam: number;
  allocatedDisk: number;
  allocatedCpu: number;
  jogVersion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Node {
  id: string;
  name: string;
  ip: string;
  port: number;
  daemonPort: number;
  maxRam: number;
  maxDisk: number;
  maxCpu: number;
  totalSlots: number;
  status: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "VERIFIED" | "FAILED" | "REJECTED" | "EXPIRED";
  proofUrl: string | null;
  txId: string | null;
  adminNote: string | null;
  decentroTxnId: string | null;
  paymentLink: string | null;
  paymentMethod: "MANUAL" | "UPI_DECENTRO";
  expiresAt: Date | null;
  createdAt: Date;
  verifiedAt: Date | null;
}

export interface Backup {
  id: string;
  serverId: string;
  name: string;
  size: number;
  createdAt: Date;
}

export interface ConsoleMessage {
  type: "stdout" | "stderr" | "command";
  message: string;
  timestamp: Date;
}
