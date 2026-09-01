# Adopt the existing guests instead of attempting to create replacements.
# Import blocks are idempotent after the resources are present in state.
import {
  to = proxmox_virtual_environment_vm.vms["100"]
  id = "proxmox/100"
}

import {
  to = proxmox_virtual_environment_vm.vms["105"]
  id = "proxmox/105"
}

import {
  to = proxmox_virtual_environment_container.containers["101"]
  id = "proxmox/101"
}

import {
  to = proxmox_virtual_environment_container.containers["103"]
  id = "proxmox/103"
}
