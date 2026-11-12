# Backend module file responsibilities

Each backend feature module separates runtime validation, transfer contracts, domain/persistence types, class contracts and Mongoose persistence.

| File | Responsibility |
| --- | --- |
| `<module>.schema.ts` | Zod runtime validation for request body/query/params. It may coerce, normalize, default and reject untrusted input. |
| `<module>.dto.ts` | Plain TypeScript request data contracts. No Zod imports or runtime validation logic. |
| `<module>.types.ts` | Domain and persistence types: enums/unions, entity shapes, Mongoose-facing fields, filters and populated entity shapes. |
| `<module>.interfaces.ts` | Class contracts such as `IPlayerController`, `IPlayerService` and `IPlayerRepository`. |
| `<module>.model.ts` | Mongoose schema/model definitions and persistence-specific document types. |
| `<module>.mapper.ts` | Converts persistence entities/documents into response-safe API DTOs where a dedicated mapper is used. |

## Request flow

1. Routes attach a schema from `<module>.schema.ts` to the validation middleware.
2. The validation middleware parses the untrusted request and replaces the request body with validated/coerced data.
3. Controllers use the matching DTO contract from `<module>.dto.ts` and call the service.
4. Services enforce CSL business rules and depend on interfaces rather than Express or Zod.
5. Repositories use module entity/filter types and Mongoose models.
6. Response mapping returns a safe, serializable response shape; never expose raw Mongoose documents or private fields.

## Naming

Use PascalCase DTO names, for example `CreatePlayerDto`, `UpdatePlayerDto`, `PlayerQueryDto`, and response DTO names such as `PlayerResponseDto`. Existing uppercase `DTO` aliases are retained temporarily where existing modules consume them; new code should use the PascalCase `Dto` naming.

## Compatibility

Existing service/type imports are kept compatible through type-only re-exports from the module `.types.ts` files while consumers can migrate to direct imports from `.interfaces.ts`. The schema files are now the only location for Zod runtime validation in the modules that accept validated requests.
