#!/bin/bash
set -e

echo "🚀 AURUM-911 Load Test"
echo "======================"

API_URL=${1:-"http://localhost:3000"}
CONCURRENT_USERS=${2:-10}
DURATION=${3:-30}

echo "Target: $API_URL"
echo "Users: $CONCURRENT_USERS"
echo "Duration: ${DURATION}s"
echo ""

# Test login endpoint
echo "Testing login endpoint..."
for i in $(seq 1 $CONCURRENT_USERS); do
    (
        for j in $(seq 1 10); do
            curl -s -X POST "$API_URL/api/v1/auth/login" \
                -H "Content-Type: application/json" \
                -d '{"email":"test@aurum.cool","password":"test123"}' \
                > /dev/null
        done
    ) &
done

wait
echo "✅ Login test completed"

# Test health endpoint
echo "Testing health endpoint..."
ab -n 1000 -c $CONCURRENT_USERS "$API_URL/health" > /tmp/health_test.log 2>&1

if grep -q "Failed requests:        0" /tmp/health_test.log; then
    echo "✅ Health endpoint test passed"
else
    echo "❌ Health endpoint test failed"
    cat /tmp/health_test.log
fi

echo ""
echo "🎉 Load test completed!"