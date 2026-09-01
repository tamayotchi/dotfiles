locals {
  containers = {
    "101" = {
      hostname    = "tailscale"
      cpu_cores   = 1
      memory_mb   = 512
      swap_mb     = 512
      disk_gb     = 2
      mac_address = "BC:24:11:CC:1E:16"
      tags        = ["community-script", "os", "tailscale"]
    }

    "103" = {
      hostname    = "adguard"
      cpu_cores   = 1
      memory_mb   = 512
      swap_mb     = 512
      disk_gb     = 2
      mac_address = "BC:24:11:6E:46:E4"
      tags        = ["adblock", "community-script"]
    }
  }
}

resource "proxmox_virtual_environment_container" "containers" {
  for_each = local.containers

  node_name = "proxmox"
  vm_id     = tonumber(each.key)

  console {
    enabled   = true
    tty_count = 2
    type      = "tty"
  }

  cpu {
    architecture = "amd64"
    cores        = each.value.cpu_cores
  }

  memory {
    dedicated = each.value.memory_mb
    swap      = each.value.swap_mb
  }

  disk {
    datastore_id = "local-lvm"
    size         = each.value.disk_gb
  }

  features {
    keyctl  = true
    nesting = true
  }

  initialization {
    hostname = each.value.hostname

    ip_config {
      ipv4 {
        address = "dhcp"
      }
    }
  }

  network_interface {
    bridge      = "vmbr0"
    mac_address = each.value.mac_address
    name        = "eth0"
  }

  operating_system {
    # Required by the provider for resource creation; imports adopt the
    # existing root filesystems and do not reinstall the containers.
    template_file_id = "local:vztmpl/debian-13-standard_13.1-2_amd64.tar.zst"
    type             = "debian"
  }

  start_on_boot = true
  started       = true
  tags          = each.value.tags
  unprivileged  = true

  lifecycle {
    prevent_destroy = true

    # The source template is not recorded for an existing LXC. Supplying one
    # satisfies provider validation, while ignoring it prevents replacement.
    ignore_changes = [description, operating_system[0].template_file_id]
  }
}
