grpc_server_cert_abspath="$CERTIFICATES_ABSPATH/$GRPC_SERVER_CERT_RELPATH"

export NODE_EXTRA_CA_CERTS="$grpc_server_cert_abspath/ca.crt"
