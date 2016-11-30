#!/bin/bash

mongo <<EOF
use ecampus

db.courses.deleteMany({date: {"$lt": ISODate()*1}})

exit
EOF
