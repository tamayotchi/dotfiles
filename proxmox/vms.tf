terraform {
  required_version = ">= 1.5.0"

  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "0.111.1"
    }
  }
}

# The API token is read from PROXMOX_VE_API_TOKEN so no secret is committed.
provider "proxmox" {
  endpoint = "https://192.168.1.86:8006"
  insecure = true
}

locals {
  # Change cpu_cores, memory_mb, or disk_gb, then review `terraform plan`.
  vms = {
    "100" = {
      name          = "home-assistant"
      cpu_cores     = 1
      cpu_type      = "qemu64"
      memory_mb     = 4096
      disk_gb       = 32
      mac_address   = "02:59:8A:17:61:96"
      agent_enabled = true
      machine       = "q35"
      usb_devices   = ["10c4:ea60", "8087:0aaa"]
    }

    "105" = {
      name          = "server"
      cpu_cores     = 2
      cpu_type      = "host"
      memory_mb     = 6144
      disk_gb       = 42
      mac_address   = "02:86:4E:DB:BF:B0"
      agent_enabled = true
      machine       = null
      usb_devices   = []
    }
  }
}

resource "proxmox_virtual_environment_vm" "vms" {
  for_each = local.vms

  name      = each.value.name
  node_name = "proxmox"
  vm_id     = tonumber(each.key)

  agent {
    enabled = each.value.agent_enabled

    # IP addresses are managed inside the guests or by DHCP reservations.
    wait_for_ip {
      disabled = true
    }
  }

  bios       = "ovmf"
  boot_order = ["scsi0"]
  machine    = each.value.machine

  cpu {
    cores   = each.value.cpu_cores
    sockets = 1
    type    = each.value.cpu_type
  }

  memory {
    dedicated = each.value.memory_mb
    floating  = 0
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    discard      = "on"
    size         = each.value.disk_gb
    ssd          = true
  }

  efi_disk {
    datastore_id = "local-lvm"
    type         = "4m"
  }

  network_device {
    bridge      = "vmbr0"
    mac_address = each.value.mac_address
    model       = "virtio"
  }

  operating_system {
    type = "l26"
  }

  on_boot             = true
  reboot_after_update = true
  scsi_hardware       = "virtio-scsi-pci"
  serial_device {}

  dynamic "usb" {
    for_each = each.value.usb_devices
    content {
      host = usb.value
    }
  }

  started       = true
  tablet_device = false
  tags          = ["community-script"]

  lifecycle {
    # These are existing, important VMs. Require an explicit source-code
    # change before Terraform is ever allowed to destroy one.
    prevent_destroy = true

    # Preserve the HTML descriptions added by the Proxmox community scripts.
    ignore_changes = [description]
  }
}
