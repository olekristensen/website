import pathlib

path = pathlib.Path('src/content/works/7.inland/index.md')
content = path.read_text()

old = 'in Dansehallerne, Copenhagen.\n\nIn the summer of 2009'
new = 'in Dansehallerne, Copenhagen.\n\n## Research Trip\n\nIn the summer of 2009'

content = content.replace(old, new)

old2 = 'settlement Savissivik\n\nFrost and Longing'
new2 = 'settlement Savissivik\n\n## Connection to Frost\n\nFrost and Longing'

content = content.replace(old2, new2)

path.write_text(content)
print('OK')
