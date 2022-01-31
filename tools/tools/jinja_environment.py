from jinja2 import Environment, PackageLoader, select_autoescape


env: Environment = Environment(
    loader=PackageLoader("tools"), autoescape=select_autoescape()
)
