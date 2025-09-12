#!/bin/sh

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="/tmp/nikki-backup.tar.gz"

rm -f "$BACKUP_FILE"

CMD="tar -czf $BACKUP_FILE"
[ -f /etc/config/nikki ] && CMD="$CMD /etc/config/nikki"
[ -d /etc/nikki/profiles ] && CMD="$CMD /etc/nikki/profiles"
[ -d /etc/nikki/run ] && CMD="$CMD /etc/nikki/run"

$CMD >/dev/null 2>&1

if [ -f "$BACKUP_FILE" ]; then
    FILESIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
    echo "Content-Type: application/octet-stream"
    echo "Content-Disposition: attachment; filename=\"nikki-backup-$DATE.tar.gz\""
    echo "Content-Length: $FILESIZE"
    echo ""
    cat "$BACKUP_FILE"
else
    echo "Content-Type: text/plain"
    echo ""
    echo "Gagal membuat backup."
fi
  
