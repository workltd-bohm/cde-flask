class Product:

    def __init__(self, product_id, name, quantity):
        self._product_id = product_id
        self._name = name
        self._quantity = quantity

    @property
    def product_id(self):
        return self._product_id

    @product_id.setter
    def product_id(self, value):
        self._product_id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def quantity(self):
        return self._quantity

    @quantity.setter
    def quantity(self, value):
        self._quantity = value

    def to_json(self, post):
        return {
                'product_id': self._product_id,
                'name':self._name,
                'quantity': self._quantity
            }

    @staticmethod
    def json_to_obj(json_file):
        return Product(json_file['product_id'],
                       json_file['name'],
                       json_file['quantity']
                       )