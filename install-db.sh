#!/bin/bash

mongo <<EOF
use admin

db.createUser(
  {
    user: "admin",
    pwd: "password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

use ecampus

db.createUser(
    {
      user: "ecampus",
      pwd: "password",
      roles: [
         { role: "readWrite", db: "ecampus" },
      ]
    }
)
db.createCollection("calendars")
db.createCollection("courses")
db.createCollection("users")

exit
EOF

echo "Database is now installed and configured"
