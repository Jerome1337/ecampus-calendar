#!/bin/bash

mongo <<EOF
use ecampus

db.createCollection("calendar")
db.createCollection("course")
db.createCollection("user")

exit
EOF

echo "Database is now installed"
