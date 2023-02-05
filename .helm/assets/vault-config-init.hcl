auto_auth = {
  method = {
    type = "kubernetes"
    config = {
      role = "ms"
    }
  }
}

sink = {
  type = "file"
  config = {
    path = "/home/vault/.token"
  }
}

exit_after_auth = true
pid_file = "/home/vault/.pid"

template = {
  destination = "/vault/secrets/postgres-storage.yaml"
  contents = <<-EOF
  {{- with secret "db/creds/ms" -}}
  username: "{{ .Data.username }}"
  password: "{{ .Data.password }}"
  {{- end }}
  EOF
}

vault = {
  ca_cert = "/vault/tls/tls.crt"
}
