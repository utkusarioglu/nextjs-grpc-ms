{{/*
Expand the name of the chart.
*/}}
{{- define "ms.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "ms.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ms.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ms.labels" -}}
helm.sh/chart: {{ include "ms.chart" . }}
{{ include "ms.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ms.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ms.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: {{ include "ms.fullname" . }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "ms.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "ms.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Service Annotations
*/}}
{{- define "ms.serviceAnnotations" }}
service.beta.kubernetes.io/aws-load-balancer-type: nlb
service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
service.beta.kubernetes.io/aws-load-balancer-internal: 0.0.0.0/0
{{- end }}

{{/*
Produce repo path from project path and repo subpath
*/}}
{{- define "ms.repoPath" -}}
{{- printf "%s/%s" .Values.env.PROJECT_ROOT_ABSPATH .Values.env.REPO_SUBPATH -}}
{{- end -}}

{{/* 
Produce absolute path for a single cert
*/}}
{{- define "ms.singleCertPath" -}}
{{- printf "%s/%s" .global.Values.env.CERTS_ABSPATH .subpath -}}
{{- end -}}
