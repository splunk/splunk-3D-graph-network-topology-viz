#!/bin/sh

echo "Configuring Splunk MLTK Permissions"
curl -k -S -s -o /dev/null -u admin:${SPLUNK_PASSWORD} https://splunk4viz:8089/services/apps/local/Splunk_ML_Toolkit/acl -d sharing=global -d owner=nobody -X POST

echo "[Check] Current Splunk MLTK Permission"
curl -k -S -s -u admin:${SPLUNK_PASSWORD} https://splunk4viz:8089/services/apps/local/Splunk_ML_Toolkit/acl?output_mode=json | jq -r '.entry | .[].acl.sharing'

# Disabling dependency installation via CLI
# NOTE: Must be used only for large apps, such as the python-for-scientific v4.2.0+
# 
# echo "Installing dependency via CLI"
# docker exec splunk4viz bash -c "sudo /opt/splunk/bin/splunk install app /tmp/ansible/python-for-scientific-computing-for-linux-64-bit_420.tgz -auth admin:${SPLUNK_PASSWORD}"