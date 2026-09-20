let _docker: any = null;

async function getDocker() {
  if (_docker) return _docker;
  const { default: Docker } = await import("dockerode");
  _docker = new Docker({
    socketPath: process.env.DOCKER_HOST || "/var/run/docker.sock",
  });
  return _docker;
}

export interface ContainerConfig {
  name: string;
  image: string;
  port: number;
  ram: number;
  cpu: number;
  env?: string[];
  volumes?: string[];
}

export async function createServer(config: ContainerConfig): Promise<string> {
  const docker = await getDocker();
  const memory = config.ram * 1024 * 1024;
  const cpuPeriod = 100000;
  const cpuQuota = (config.cpu / 100) * cpuPeriod;

  const container = await docker.createContainer({
    Image: config.image,
    name: `mc-${config.name}`,
    Env: config.env || [],
    ExposedPorts: {
      "25565/tcp": {},
    },
    HostConfig: {
      PortBindings: {
        "25565/tcp": [{ HostPort: config.port.toString() }],
      },
      Memory: memory,
      CpuPeriod: cpuPeriod,
      CpuQuota: cpuQuota,
      Binds: config.volumes || [],
    },
    Labels: {
      notixcloud: "true",
      "notixcloud.server": config.name,
    },
  });

  await container.start();
  return container.id;
}

export async function startServer(containerId: string): Promise<void> {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);
  await container.start();
}

export async function stopServer(containerId: string): Promise<void> {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);
  await container.stop({ t: 30 });
}

export async function restartServer(containerId: string): Promise<void> {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);
  await container.restart({ t: 30 });
}

export async function removeServer(containerId: string): Promise<void> {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);
  try {
    await container.stop({ t: 10 });
  } catch {
    // Container might already be stopped
  }
  await container.remove({ v: true });
}

export async function sendCommand(
  containerId: string,
  command: string
): Promise<string> {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);

  const exec = await container.exec({
    Cmd: ["/bin/sh", "-c", command],
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({ Detach: false });

  return new Promise((resolve, reject) => {
    let output = "";
    stream.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    stream.on("end", () => resolve(output));
    stream.on("error", reject);
  });
}

export async function getContainerStats(containerId: string) {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);

  try {
    const stats = await container.stats({ stream: false });

    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage -
      stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus;

    const cpuPercent =
      systemDelta > 0 ? (cpuDelta / systemDelta) * cpuCount * 100 : 0;

    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 0;
    const memoryPercent =
      memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

    return {
      cpu: Math.round(cpuPercent * 100) / 100,
      memory: Math.round(memoryPercent * 100) / 100,
      memoryUsage: Math.round(memoryUsage / (1024 * 1024)),
      memoryLimit: Math.round(memoryLimit / (1024 * 1024)),
    };
  } catch {
    return {
      cpu: 0,
      memory: 0,
      memoryUsage: 0,
      memoryLimit: 0,
    };
  }
}

export async function getContainerLogs(
  containerId: string,
  tail = 100
): Promise<string[]> {
  const docker = await getDocker();
  const container = docker.getContainer(containerId);

  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  });

  return logs.toString().split("\n").filter(Boolean);
}

export async function getContainerStatus(
  containerId: string
): Promise<{ running: boolean; status: string }> {
  try {
    const docker = await getDocker();
    const container = docker.getContainer(containerId);
    const inspect = await container.inspect();
    return {
      running: inspect.State.Running,
      status: inspect.State.Status,
    };
  } catch {
    return { running: false, status: "not_found" };
  }
}

export async function pullImage(image: string): Promise<void> {
  const docker = await getDocker();
  return new Promise((resolve, reject) => {
    docker.pull(
      image,
      (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);

        docker.modem.followProgress(
          stream,
          (err: Error | null) => {
            if (err) return reject(err);
            resolve();
          }
        );
      }
    );
  });
}

export { getDocker };
export default getDocker;
