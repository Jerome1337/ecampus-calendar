#!/bin/bash
SQL="DELETE FROM course WHERE date < CURDATE()"

MYSQL_USER="XXXXXXXX"
MYSQL_PASS="XXXXXXXX"
MYSQL_DB="ecampus"

echo $SQL | /usr/bin/mysql --user=$MYSQL_USER --password=$MYSQL_PASS $MYSQL_DB
