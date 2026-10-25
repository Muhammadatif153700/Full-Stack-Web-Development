const ApiError = require("./ApiError");

class CrudController {
  constructor({ repository, schema, beforeCreate, beforeUpdate, beforeDelete }) {
    this.repository = repository;
    this.schema = schema;
    this.beforeCreate = beforeCreate ?? (() => {});
    this.beforeUpdate = beforeUpdate ?? (() => {});
    this.beforeDelete = beforeDelete ?? (() => {});
  }

  list(query = {}) {
    const filters = {};

    Object.keys(query).forEach((key) => {
      const fieldDef = this.schema.fields[key];
      if (!fieldDef) return;

      const val = query[key];
      if (fieldDef.type === "whole" || fieldDef.type === "decimal") {
        const numVal = Number(val);
        const isInvalid = !Number.isFinite(numVal) || (fieldDef.type === "whole" && !Number.isSafeInteger(numVal));

        if (isInvalid) {
          throw ApiError.badRequest(`${key} must be a valid ${fieldDef.type}`);
        }
        filters[key] = numVal;
      } else {
        filters[key] = val;
      }
    });

    const cleanFilters = this.schema.sanitize(filters, { partial: true });
    return this.repository.findWhere(cleanFilters);
  }

  show(id) {
    const item = this.repository.findById(id);
    if (!item) throw ApiError.notFound("Record not found");
    return item;
  }

  create(body) {
    const payload = this.schema.sanitize(body);
    this.beforeCreate(payload);
    return this.repository.insert(payload);
  }

  replace(id, body) {
    const existing = this.show(id);
    const payload = this.schema.sanitize(body);
    this.beforeUpdate(payload, existing);
    return this.repository.overwrite(id, payload);
  }

  patch(id, body) {
    const existing = this.show(id);
    const payload = this.schema.sanitize(body, { partial: true });
    this.beforeUpdate(Object.assign({}, existing, payload), existing);
    return this.repository.merge(id, payload);
  }

  destroy(id) {
    const existing = this.show(id);
    this.beforeDelete(existing);
    this.repository.erase(id);
    return { message: "Record deleted successfully" };
  }
}

module.exports = CrudController;
