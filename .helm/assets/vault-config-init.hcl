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
  # TODO this path needs to include `inflation`. And that change probably requires rebuilding the image
  destination = "/vault/credentials/postgres-storage/inflation/ms.yaml"
  contents = <<-EOF
  {{- with secret "postgres-storage/inflation/creds/ms" -}}
  postgresStorage:
    credentials:
      inflation:
        username: "{{ .Data.username }}"
        password: "{{ .Data.password }}"
  {{- end }}
  EOF
}

vault = {
  ca_cert = "/vault/tls/tls.crt"
}
