"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RucCache = void 0;
const typeorm_1 = require("typeorm");
let RucCache = class RucCache {
    ruc;
    data;
    updatedAt;
};
exports.RucCache = RucCache;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 13 }),
    __metadata("design:type", String)
], RucCache.prototype, "ruc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], RucCache.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RucCache.prototype, "updatedAt", void 0);
exports.RucCache = RucCache = __decorate([
    (0, typeorm_1.Entity)('ruc_cache')
], RucCache);
//# sourceMappingURL=ruc-cache.entity.js.map