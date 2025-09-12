module("luci.controller.nikki", package.seeall)

function index()
    -- Menu utama di LuCI
    entry({"admin", "services", "nikki"}, firstchild(), _("Nikki"), 90)
    entry({"admin", "services", "nikki", "backup"}, template("nikki/backup"), _("BACKUP/RESTORE"), 16).leaf = true

    -- Route restore via function
    entry({"admin", "services", "nikki", "restore"}, call("do_restore")).leaf = true
end

function do_restore()
    local http = require "luci.http"
    local fs = require "nixio.fs"

    -- handle upload
    http.setfilehandler(
        function(meta, chunk, eof)
            local upload_path = "/tmp/nikki-backup.tar.gz"
            if chunk then
                local f = io.open(upload_path, meta and "wb" or "ab")
                f:write(chunk)
                f:close()
            end
        end
    )

    local upload_file = "/tmp/nikki-backup.tar.gz"
    http.prepare_content("text/html")
    if fs.access(upload_file) then
        local ret = os.execute("tar -xzf " .. upload_file .. " -C /")
        if ret == 0 then
            -- langsung refresh ke halaman backup tanpa notif
            http.write([[
                <html>
                <head>
                <meta http-equiv="refresh" content="0; URL=/cgi-bin/luci/admin/services/nikki/backup">
                </head>
                <body></body>
                </html>
            ]])
        else
            http.write([[
                <html><body><p>Restore gagal!</p></body></html>
            ]])
        end
    else
        http.write([[
            <html><body><p>File backup tidak ditemukan!</p></body></html>
        ]])
    end
end

