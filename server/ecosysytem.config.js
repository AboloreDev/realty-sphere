module.exports = {
  apps: [
    {
      name: "nestora-project",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
