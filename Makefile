.PHONY : setup tests

setup:
	APP_NAME=splunk-3D-graph-network-topology-viz docker compose up -d --build

tests:
	cd test && npm install && npm run debug