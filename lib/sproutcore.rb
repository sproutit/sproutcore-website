# Returns the item with the given identifier.
def item_named(identifier)
  @items.find { |item| item.identifier == identifier }
end