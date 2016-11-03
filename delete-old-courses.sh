#!/bin/bash

mongo <<EOF
use ecampus

db.course.deleteMany({date: {"$lt": ISODate()}})

exit
EOF
