#!/bin/bash

# Run k6 load tests
docker run --rm -i \
--network queue_network \
-e K6_OUT=json=/results/results.json \
-v "$(pwd)/load-test.js:/load-test.js:ro" \
-v "$(pwd)/results:/results" \
grafana/k6 run /load-test.js
