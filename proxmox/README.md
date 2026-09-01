# Proxmox Terraform configuration

This project adopts and manages the existing Proxmox guests:

- QEMU VM 100: Home Assistant
- LXC 101: Tailscale
- LXC 103: AdGuard Home
- QEMU VM 105: server

CPU, RAM, disk, network hardware, and core guest settings are managed with the
[`bpg/proxmox`](https://registry.terraform.io/providers/bpg/proxmox/latest)
provider. VM 104 was retired on 2026-09-01 after a final backup was created at
`local:backup/vzdump-qemu-104-2026_09_01-14_25_43.vma.zst`.

Desired VM resources are in [`vms.tf`](./vms.tf), and LXC resources are in
[`containers.tf`](./containers.tf).

## Authentication

The endpoint and TLS behavior are configured in `versions.tf`. Only the secret
API token is read from the environment:

```bash
export PROXMOX_VE_API_TOKEN='USER@REALM!TOKEN-ID=TOKEN-SECRET'
```

Use single quotes around the token. Do not put a backslash before `!` inside a
single-quoted value. The provider currently has `insecure = true` because the
Proxmox endpoint uses a certificate that this machine does not trust.

The token needs access to the managed VMs and containers plus
`Datastore.Audit` and `Datastore.AllocateSpace` on their storage.

## Usage

Always review the plan before applying:

```bash
cd ~/dotfiles/proxmox
terraform init
terraform plan -out=proxmox.tfplan
terraform apply proxmox.tfplan
```

The import blocks adopt existing guests and become no-ops after import. Every
guest has `prevent_destroy = true`, so Terraform cannot accidentally delete
it. VM updates that require a power cycle may reboot the VM because
`reboot_after_update = true`.

## Changing resources

Edit the corresponding entry in `local.vms` or `local.containers`, then plan
and apply. For example:

```hcl
"105" = {
  name          = "server"
  cpu_cores     = 4
  cpu_type      = "host"
  memory_mb     = 8192
  disk_gb       = 42
  mac_address   = "02:86:4E:DB:BF:B0"
  agent_enabled = true
  machine       = null
  usb_devices   = []
}
```

Disk sizes can only grow. Growing a VM's virtual disk may also require growing
the partition and filesystem inside the guest.

## Static IP addresses

The QEMU VMs do not have cloud-init disks, so Terraform cannot safely set their
guest addresses through Proxmox. Use DHCP reservations on the router for their
fixed MAC addresses, or configure networking inside each guest.
