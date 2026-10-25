const ApiError = require("./ApiError");

class Schema {
  constructor(fields) {
    this.fields = fields;
  }

  sanitize(input, { partial = false } = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw ApiError.badRequest("Request data must be an object");
    }

    const output = {};
    for (const name in this.fields) {
      if (!Object.prototype.hasOwnProperty.call(this.fields, name)) continue;
      const definition = this.fields[name];

      if (!(name in input)) {
        if (!partial && definition.required !== false) {
          throw ApiError.badRequest(`${name} is required`);
        }
        continue;
      }

      output[name] = this.validate(name, input[name], definition);
    }
    return output;
  }

  validate(name, value, definition) {
    const fail = () => {
      throw ApiError.badRequest(`${name} must be a valid ${definition.type}`);
    };

    const type = definition.type;

    if (type === "text") {
      if (typeof value !== "string" || !value.trim()) fail();
      return value.trim();
    }

    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof value !== "string" || !emailRegex.test(value.trim())) fail();
      return value.trim();
    }

    if (type === "whole") {
      if (!Number.isSafeInteger(value)) fail();
      return value;
    }

    if (type === "decimal") {
      if (typeof value !== "number" || !Number.isFinite(value)) fail();
      return value;
    }

    if (type === "day") {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail();
      const date = new Date(`${value}T00:00:00.000Z`);
      if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        fail();
      }
      return value;
    }

    if (type === "choice") {
      if (!definition.options.includes(value)) fail();
      return value;
    }

    throw new Error(`Unsupported schema type: ${type}`);
  }
}

module.exports = Schema;
