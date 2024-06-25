#!/bin/bash
set -x
# 定义包含要删除文件路径的文件
FILES_TO_DELETE="not_able_render_files.txt"

# 检查文件是否存在
if [ ! -f "$FILES_TO_DELETE" ]; then
  echo "文件 $FILES_TO_DELETE 不存在。"
  exit 1
fi

# 读取文件列表并删除相应的文件
while IFS= read -r file_path
do
  # 检查文件是否存在，然后删除
  if [ -f "$file_path" ]; then
    rm -v "$file_path"
  else
    echo "文件 $file_path 不存在，跳过。"
  fi
done < "$FILES_TO_DELETE"

echo "文件删除完成。"
