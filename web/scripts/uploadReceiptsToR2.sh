#!/bin/sh

rclone copy src/receipts/ r2:accounting/ --include "*.pdf"
