import { join } from "https://deno.land/std@0.194.0/path/mod.ts";
import { ensureFile } from "https://deno.land/std@0.194.0/fs/ensure_file.ts"
import { format } from "https://deno.land/std@0.194.0/datetime/format.ts";


const COLOR_STATUS_REG = /.\[3\wm(\w{3}).\[0m/

// 写文件 logger
export async function writeDateLog(text: string, date = new Date(), dir = './logs') {
    const filepath = join(dir,  format(date, 'yyyy/MM-dd'))
    await ensureFile(filepath)
    const withoutColorText = text.replace(COLOR_STATUS_REG, '$1')
    const record =`${format(date, "HH:mm:ss.SSS")} - ${withoutColorText}\n`
    await Deno.writeTextFile(filepath, record, {
        append: true
    })
}


// 输出控制台 logger
export function consoleDateLog(text: string, date: Date = new Date()) {
    console.log(format(date, "yyyy-MM-dd HH:mm:ss.SSS"), text);
}