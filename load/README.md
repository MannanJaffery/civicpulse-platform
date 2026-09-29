# Load Testing & Autoscaling Verification (§3.3 & Rubric H)

This directory contains load generation scripts and procedures to verify Horizontal Pod Autoscaler (HPA v2) and Vertical Pod Autoscaler (VPA in Recommender mode) under Kubernetes.

---

## 1. Prerequisites
- `metrics-server` installed on cluster:
  ```bash
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  ```
- `k6` installed locally or run via container:
  ```bash
  docker run --rm -i --net=host grafana/k6 run - <load/k6-script.js
  ```

---

## 2. Running Load Test for HPA Scale-Out

1. Open a terminal to watch the HPA in real time:
   ```bash
   kubectl get hpa backend-hpa -n civicpulse -w
   ```
2. In a second terminal, execute the load generator:
   ```bash
   k6 run load/k6-script.js -e TARGET_URL=http://localhost:8000
   ```
3. Observe pod replicas scaling from 2 up to 10 as CPU utilization crosses the 60% threshold.

---

## 3. VPA Recommender Analysis Loop

1. Record initial CPU/Memory requests from `k8s/base/backend.yaml`.
2. Generate sustained load for 5 minutes.
3. Query VPA sizing recommendations:
   ```bash
   kubectl describe vpa backend-vpa -n civicpulse
   ```
4. Note the Target, Lower Bound, and Upper Bound recommendations.
5. Update pod requests to match the Target recommendations and re-test.
