# Kubernetes Deployment Guide

This guide explains how to deploy the **Substrate Platform** to a Kubernetes cluster. The configuration files are located in the `k8s/` directory.

## Prerequisites

*   A running Kubernetes cluster (Minikube, EKS, GKE, AKS, etc.)
*   `kubectl` installed and configured locally
*   Docker image available in a container registry (built via `docker build -t substrate-platform .`)

## Configuration Structure

The `k8s/` directory contains standard manifest files:

*   `deployment.yaml`: Defines the application pods, replicas, and resources.
*   `service.yaml`: Exposes the pods internally via ClusterIP.
*   `ingress.yaml`: Exposes the service externally (requires an Ingress Controller).
*   `configmap.yaml`: Stores environment variables and configuration.
*   `kustomization.yaml`: Bundles resources for easier deployment.

## Quick Start (with Kustomize)

The easiest way to deploy is using `kubectl` with Kustomize support (built-in).

1.  **Deploy resources**:
    ```bash
    kubectl apply -k k8s/
    ```

2.  **Verify deployment**:
    ```bash
    kubectl get pods -l app=substrate-platform
    ```

3.  **Check logs**:
    ```bash
    kubectl logs -l app=substrate-platform
    ```

## Manual Deployment

If you prefer applying files individually:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## Customizing Configuration

### updating ConfigMap
Edit `k8s/configmap.yaml` to change environment variables:

```yaml
data:
  LOG_LEVEL: "debug"
  ENABLE_METRICS: "false"
```

After editing, apply the changes and restart the rollout:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl rollout restart deployment/substrate-platform
```

### Ingress Host
Update `k8s/ingress.yaml` to match your actual domain name:

```yaml
rules:
  - host: my-platform.example.com
```

## Resource Limits
The default deployment is configured with conservative resource limits in `deployment.yaml`. Adjust these based on your actual load and metrics.

```yaml
resources:
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Scaling
To scale the application manually:

```bash
kubectl scale deployment/substrate-platform --replicas=3
```
