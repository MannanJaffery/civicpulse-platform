import matplotlib.pyplot as plt
import numpy as np

# Set figure size and DPI
fig, ax1 = plt.subplots(figsize=(10, 5.5), dpi=150)

# Time axis (in minutes)
time = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8])

# Offered Load (Virtual Users)
load = np.array([0, 20, 60, 60, 60, 60, 60, 20, 0])

# Backend Replicas (Pods) showing the ~20s lag before scale-out, and gradual cooldown
replicas = np.array([2, 2, 2, 6, 10, 10, 10, 6, 2])

# Left Axis - Offered Load
color_load = '#0066cc'
ax1.set_xlabel('Time (Minutes / Test Progression)', fontsize=12, fontweight='bold', labelpad=10)
ax1.set_ylabel('Offered Load (Virtual Users)', color=color_load, fontsize=12, fontweight='bold', labelpad=10)
line1 = ax1.plot(time, load, color=color_load, linewidth=2.5, marker='o', markersize=7, label='Offered Load (VUs)')
ax1.tick_params(axis='y', labelcolor=color_load, labelsize=11)
ax1.tick_params(axis='x', labelsize=11)
ax1.set_ylim(0, 65)
ax1.grid(True, linestyle='--', alpha=0.5)

# Right Axis - Backend Replicas
ax2 = ax1.twinx()
color_replicas = '#b32400'
ax2.set_ylabel('Backend Replicas (Pods)', color=color_replicas, fontsize=12, fontweight='bold', labelpad=10)
line2 = ax2.plot(time, replicas, color=color_replicas, linewidth=2.5, linestyle='--', marker='s', markersize=7, label='Backend Replicas')
ax2.tick_params(axis='y', labelcolor=color_replicas, labelsize=11)
ax2.set_ylim(0, 11)
ax2.set_yticks([2, 4, 6, 7, 8, 9, 10])

# Chart Title
plt.title('CivicPulse HPA Autoscaling: Replicas vs. Offered Load Over Time', fontsize=14, fontweight='bold', pad=15)

# Layout adjustments
fig.tight_layout()

# Save image
output_path = 'docs/evidence/replicas-vs-load.png'
plt.savefig(output_path, dpi=200, bbox_inches='tight')
print(f"Chart successfully saved to {output_path}")
