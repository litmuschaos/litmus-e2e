# Bashscript for updating mages in manifest.
# Here "|" (pipe) is used as delimiter for sed command.

#!/bin/bash

set -e

sed -i -e "s|litmuschaos/litmusportal-frontend:ci|$FrontendImage|g" $1
sed -i -e "s|litmuschaos/litmusportal-server:ci|$BackendImage|g" $1
sed -i -e "s|litmuschaos/litmusportal-auth-server:ci|$AuthImage|g" $1