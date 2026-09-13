import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { provisionNode, terminateNode } from "@/lib/cloud";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "provision") {
      const { name, provider, credentials, region, ram, cpu, disk } = body;

      if (!name || !provider || !credentials) {
        return NextResponse.json(
          { error: "Name, provider, and credentials are required" },
          { status: 400 }
        );
      }

      const result = await provisionNode({
        name,
        provider,
        credentials,
        region,
        ram: ram || 8192,
        cpu: cpu || 4,
        disk: disk || 50000,
      });

      return NextResponse.json(result);
    }

    if (action === "terminate") {
      const { nodeId, provider, credentials, instanceId } = body;

      if (!nodeId || !provider || !credentials || !instanceId) {
        return NextResponse.json(
          { error: "Node ID, provider, credentials, and instance ID are required" },
          { status: 400 }
        );
      }

      await terminateNode(nodeId, provider, credentials, instanceId);

      return NextResponse.json({ success: true });
    }

    if (action === "test") {
      const { provider, credentials } = body;

      if (!provider || !credentials) {
        return NextResponse.json(
          { error: "Provider and credentials are required" },
          { status: 400 }
        );
      }

      let result = false;

      try {
        switch (provider) {
          case "oracle": {
            const { OracleCloudClient } = await import("@/lib/cloud/oracle");
            const client = new OracleCloudClient({
              tenancyOcId: credentials.tenancyOcId || "",
              userId: credentials.userId || "",
              fingerprint: credentials.fingerprint || "",
              privateKey: credentials.privateKey || "",
              region: credentials.region || "us-ashburn-1",
              compartmentId: credentials.compartmentId || "",
            });
            await client.listInstances();
            result = true;
            break;
          }
          case "hetzner": {
            const { HetznerClient } = await import("@/lib/cloud/hetzner");
            const client = new HetznerClient({
              apiToken: credentials.apiToken || "",
            });
            await client.listServers();
            result = true;
            break;
          }
          case "vultr": {
            const { VultrClient } = await import("@/lib/cloud/vultr");
            const client = new VultrClient({
              apiKey: credentials.apiKey || "",
            });
            await client.listInstances();
            result = true;
            break;
          }
        }
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: error.message,
        });
      }

      return NextResponse.json({ success: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Cloud provisioning error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
