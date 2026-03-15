---
title: Docker Basics — A Practical Guide
date: 2026-03-15
description: Everything I wish I knew when I started with Docker
tags:
  - coding/devops
  - coding/docker
published: true
---
Docker is a platform for running applications in isolated containers.
This is my practical guide to getting started.

## What is a Container?

A container is a lightweight, isolated environment that packages your
application with everything it needs to run — code, runtime, libraries,
and config.

Unlike a virtual machine, containers share the host OS kernel, making
them much faster to start and more efficient with resources.

## Basic Commands

```bash
# Run a container
docker run nginx

# List running containers
docker ps

# Stop a container
docker stop <container-id>

# View logs
docker logs <container-name>
```

## Docker Compose

For multi-container applications, Docker Compose lets you define
everything in a single YAML file:

```yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: secret
```

Then start everything with:

```bash
docker compose up -d
```

## Key Concepts

| Concept | Description |
|---|---|
| Image | Blueprint for a container |
| Container | Running instance of an image |
| Volume | Persistent storage |
| Network | Communication between containers |
| Registry | Storage for images (Docker Hub, GHCR) |

## What I Use Docker For

- Running Seafile for personal file storage
- Deploying this website via GitHub Actions
- Local development environments

Docker changed how I think about software deployment — everything
reproducible, everything isolated, nothing installed directly on the host