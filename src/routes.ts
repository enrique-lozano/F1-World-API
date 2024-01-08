/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CountryController } from './modules/countries/countries.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CircuitController } from './modules/circuit/circuit.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompanyController } from './modules/company/company.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DriverController } from './modules/driver/driver.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DriverStandingController } from './modules/driver-standings/driver-standings.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EventController } from './modules/event/event.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GrandPrixController } from './modules/grands-prix/grandPrix.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TyreManufacturerService } from './modules/tyreManufacturer.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SessionEntrantController } from './modules/session-entrants/sessionEntrant.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FreePracticeResultService } from './modules/results/freePracticeResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { QualifyingResultService } from './modules/results/qualifyingResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RaceResultService } from './modules/results/raceResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PitStopController } from './modules/pit-stops/pitStop.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SessionController } from './modules/session/session.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LapController } from './modules/laps/lap.controller';
import type { RequestHandler, Router } from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "CountryDTO": {
        "dataType": "refObject",
        "properties": {
            "alpha2Code": {"dataType":"string","required":true},
            "alpha3Code": {"dataType":"string","required":true},
            "region": {"dataType":"string","required":true},
            "subregion": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "commonName": {"dataType":"string","required":true},
            "officialName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HttpStatusCodeLiteral": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[100]},{"dataType":"enum","enums":[101]},{"dataType":"enum","enums":[102]},{"dataType":"enum","enums":[200]},{"dataType":"enum","enums":[201]},{"dataType":"enum","enums":[202]},{"dataType":"enum","enums":[203]},{"dataType":"enum","enums":[204]},{"dataType":"enum","enums":[205]},{"dataType":"enum","enums":[206]},{"dataType":"enum","enums":[207]},{"dataType":"enum","enums":[208]},{"dataType":"enum","enums":[226]},{"dataType":"enum","enums":[300]},{"dataType":"enum","enums":[301]},{"dataType":"enum","enums":[302]},{"dataType":"enum","enums":[303]},{"dataType":"enum","enums":[304]},{"dataType":"enum","enums":[305]},{"dataType":"enum","enums":[307]},{"dataType":"enum","enums":[308]},{"dataType":"enum","enums":[400]},{"dataType":"enum","enums":[401]},{"dataType":"enum","enums":[402]},{"dataType":"enum","enums":[403]},{"dataType":"enum","enums":[404]},{"dataType":"enum","enums":[405]},{"dataType":"enum","enums":[406]},{"dataType":"enum","enums":[407]},{"dataType":"enum","enums":[408]},{"dataType":"enum","enums":[409]},{"dataType":"enum","enums":[410]},{"dataType":"enum","enums":[411]},{"dataType":"enum","enums":[412]},{"dataType":"enum","enums":[413]},{"dataType":"enum","enums":[414]},{"dataType":"enum","enums":[415]},{"dataType":"enum","enums":[416]},{"dataType":"enum","enums":[417]},{"dataType":"enum","enums":[418]},{"dataType":"enum","enums":[422]},{"dataType":"enum","enums":[423]},{"dataType":"enum","enums":[424]},{"dataType":"enum","enums":[426]},{"dataType":"enum","enums":[428]},{"dataType":"enum","enums":[429]},{"dataType":"enum","enums":[431]},{"dataType":"enum","enums":[451]},{"dataType":"enum","enums":[500]},{"dataType":"enum","enums":[501]},{"dataType":"enum","enums":[502]},{"dataType":"enum","enums":[503]},{"dataType":"enum","enums":[504]},{"dataType":"enum","enums":[505]},{"dataType":"enum","enums":[506]},{"dataType":"enum","enums":[507]},{"dataType":"enum","enums":[508]},{"dataType":"enum","enums":[510]},{"dataType":"enum","enums":[511]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JsonApiError": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"HttpStatusCodeLiteral","required":true},
            "code": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "detail": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PageMetadata": {
        "dataType": "refObject",
        "properties": {
            "pageSize": {"dataType":"double","required":true},
            "totalElements": {"dataType":"double","required":true},
            "currentPage": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CircuitDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "previousNames": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["RACE"]},{"dataType":"enum","enums":["ROAD"]},{"dataType":"enum","enums":["STREET"]}],"required":true},
            "placeName": {"dataType":"string","required":true},
            "latitude": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "longitude": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "country": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CircuitQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "founder": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "yearFounded": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "country": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Gender": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MALE"]},{"dataType":"enum","enums":["FEMALE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DriverDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "abbreviation": {"dataType":"string","required":true},
            "permanentNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "gender": {"ref":"Gender","required":true},
            "dateOfBirth": {"dataType":"string","required":true},
            "dateOfDeath": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "placeOfBirth": {"dataType":"string","required":true},
            "photo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "countryOfBirthCountry": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "nationalityCountry": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "secondNationalityCountry": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DriverQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "name": {"dataType":"string"},
            "nationalityId": {"dataType":"string"},
            "birthBefore": {"dataType":"string","validators":{"pattern":{"value":"[0-9]{4}-[0-9]{2}-[0-9]{2}"}}},
            "birthAfter": {"dataType":"string","validators":{"pattern":{"value":"[0-9]{4}-[0-9]{2}-[0-9]{2}"}}},
            "gender": {"ref":"Gender"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GrandsPrix": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "shortName": {"dataType":"string","required":true},
            "countryId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "raceDate": {"dataType":"string","required":true},
            "qualyFormat": {"dataType":"string","required":true},
            "scheduledLaps": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "posterURL": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "grandPrix": {"dataType":"union","subSchemas":[{"ref":"GrandsPrix"},{"dataType":"enum","enums":[null]}],"required":true},
            "circuit": {"dataType":"union","subSchemas":[{"ref":"CircuitDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "circuitId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IncludeQueryParam": {
        "dataType": "refObject",
        "properties": {
            "include": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GrandsPrixDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "shortName": {"dataType":"string","required":true},
            "country": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GrandPrixQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "name": {"dataType":"string"},
            "countryId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TyreManufacturerDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "primaryColor": {"dataType":"string","required":true},
            "secondaryColor": {"dataType":"string","required":true},
            "country": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PageQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SeasonEntrantDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "season": {"dataType":"double","required":true},
            "country": {"dataType":"union","subSchemas":[{"ref":"CountryDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventEntrantDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "driverNumber": {"dataType":"double","required":true},
            "entrantName": {"dataType":"string","required":true},
            "chassisName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "engineName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "note": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "driver": {"dataType":"union","subSchemas":[{"ref":"DriverDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "seasonEntrant": {"dataType":"union","subSchemas":[{"ref":"SeasonEntrantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "tyreManufacturer": {"dataType":"union","subSchemas":[{"ref":"TyreManufacturerDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "chassisManufacturer": {"dataType":"union","subSchemas":[{"ref":"CompanyDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "engineManufacturer": {"dataType":"union","subSchemas":[{"ref":"CompanyDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntrantQueryParam": {
        "dataType": "refObject",
        "properties": {
            "driverId": {"dataType":"string"},
            "season": {"dataType":"double"},
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimedSessionResultsDTO": {
        "dataType": "refObject",
        "properties": {
            "positionOrder": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "positionText": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "laps": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "session": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrant": {"dataType":"union","subSchemas":[{"ref":"EventEntrantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimedSessionResultQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "season": {"dataType":"double"},
            "round": {"dataType":"double"},
            "session": {"dataType":"string"},
            "driverId": {"dataType":"string"},
            "minPos": {"dataType":"integer","validators":{"minimum":{"errorMsg":"The minimum value of `minPos` should be 1","value":1},"isInt":{"errorMsg":"The `minPos` param should be an integer"}}},
            "maxPos": {"dataType":"integer","validators":{"minimum":{"errorMsg":"The minimum value of `maxPos` should be 1","value":1},"isInt":{"errorMsg":"The `maxPos` param should be an integer"}}},
            "positionText": {"dataType":"string"},
            "orderBy": {"dataType":"enum","enums":["entrantId","sessionId","positionOrder","positionText","time","laps"],"default":"sessionId"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RaceResultDTO": {
        "dataType": "refObject",
        "properties": {
            "positionOrder": {"dataType":"double","required":true},
            "positionText": {"dataType":"string","required":true},
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "gridPosition": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "gridPenalty": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "laps": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "points": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "pointsCountForWDC": {"dataType":"double","required":true},
            "pointsGained": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "timePenalty": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "reasonRetired": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "session": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrant": {"dataType":"union","subSchemas":[{"ref":"EventEntrantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RaceResultQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "season": {"dataType":"double"},
            "round": {"dataType":"double"},
            "session": {"dataType":"string"},
            "driverId": {"dataType":"string"},
            "minPos": {"dataType":"integer","validators":{"minimum":{"errorMsg":"The minimum value of `minPos` should be 1","value":1},"isInt":{"errorMsg":"The `minPos` param should be an integer"}}},
            "maxPos": {"dataType":"integer","validators":{"minimum":{"errorMsg":"The minimum value of `maxPos` should be 1","value":1},"isInt":{"errorMsg":"The `maxPos` param should be an integer"}}},
            "positionText": {"dataType":"string"},
            "maxGridPos": {"dataType":"double"},
            "minGridPos": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SessionDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "abbreviation": {"dataType":"string","required":true},
            "startDateTime": {"dataType":"string","required":true},
            "event": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PitStopDTO": {
        "dataType": "refObject",
        "properties": {
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "lap": {"dataType":"double","required":true},
            "timeOfDay": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "annotation": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "session": {"dataType":"union","subSchemas":[{"ref":"SessionDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrant": {"dataType":"union","subSchemas":[{"ref":"EventEntrantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PitStopQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "season": {"dataType":"double"},
            "round": {"dataType":"double"},
            "session": {"dataType":"string"},
            "driverId": {"dataType":"string"},
            "lap": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LapTimeDTO": {
        "dataType": "refObject",
        "properties": {
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "lap": {"dataType":"double","required":true},
            "pos": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "session": {"dataType":"union","subSchemas":[{"ref":"SessionDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrant": {"dataType":"union","subSchemas":[{"ref":"EventEntrantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LapQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "sort": {"dataType":"string"},
            "include": {"dataType":"string"},
            "season": {"dataType":"double"},
            "round": {"dataType":"double"},
            "session": {"dataType":"string"},
            "driverId": {"dataType":"string"},
            "pos": {"dataType":"double"},
            "lap": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.get('/countries',
            ...(fetchMiddlewares<RequestHandler>(CountryController)),
            ...(fetchMiddlewares<RequestHandler>(CountryController.prototype.get)),

            function CountryController_get(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CountryController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/countries/:countryId',
            ...(fetchMiddlewares<RequestHandler>(CountryController)),
            ...(fetchMiddlewares<RequestHandler>(CountryController.prototype.getById)),

            function CountryController_getById(request: any, response: any, next: any) {
            const args = {
                    countryId: {"in":"path","name":"countryId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CountryController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/circuits',
            ...(fetchMiddlewares<RequestHandler>(CircuitController)),
            ...(fetchMiddlewares<RequestHandler>(CircuitController.prototype.get)),

            function CircuitController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"CircuitQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CircuitController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/circuits/:id',
            ...(fetchMiddlewares<RequestHandler>(CircuitController)),
            ...(fetchMiddlewares<RequestHandler>(CircuitController.prototype.getById)),

            function CircuitController_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CircuitController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/companies',
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.get)),

            function CompanyController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"CompanyQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/companies/:id',
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getById)),

            function CompanyController_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers',
            ...(fetchMiddlewares<RequestHandler>(DriverController)),
            ...(fetchMiddlewares<RequestHandler>(DriverController.prototype.get)),

            function DriverController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"DriverQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId',
            ...(fetchMiddlewares<RequestHandler>(DriverController)),
            ...(fetchMiddlewares<RequestHandler>(DriverController.prototype.getById)),

            function DriverController_getById(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId/relationships',
            ...(fetchMiddlewares<RequestHandler>(DriverController)),
            ...(fetchMiddlewares<RequestHandler>(DriverController.prototype.getDriverFamilyRelationships)),

            function DriverController_getDriverFamilyRelationships(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverController();


              const promise = controller.getDriverFamilyRelationships.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId/seasons',
            ...(fetchMiddlewares<RequestHandler>(DriverController)),
            ...(fetchMiddlewares<RequestHandler>(DriverController.prototype.getDriverSeasons)),

            function DriverController_getDriverSeasons(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverController();


              const promise = controller.getDriverSeasons.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId/championship-results',
            ...(fetchMiddlewares<RequestHandler>(DriverController)),
            ...(fetchMiddlewares<RequestHandler>(DriverController.prototype.getChampionshipResults)),

            function DriverController_getChampionshipResults(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverController();


              const promise = controller.getChampionshipResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/championships/:season/drivers',
            ...(fetchMiddlewares<RequestHandler>(DriverStandingController)),
            ...(fetchMiddlewares<RequestHandler>(DriverStandingController.prototype.getDriverChampionshipResults)),

            function DriverStandingController_getDriverChampionshipResults(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"query","name":"round","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverStandingController();


              const promise = controller.getDriverChampionshipResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/championships/:season/drivers/:driverId',
            ...(fetchMiddlewares<RequestHandler>(DriverStandingController)),
            ...(fetchMiddlewares<RequestHandler>(DriverStandingController.prototype.getDriverChampionshipResult)),

            function DriverStandingController_getDriverChampionshipResult(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    round: {"in":"query","name":"round","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverStandingController();


              const promise = controller.getDriverChampionshipResult.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/events',
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.get)),

            function EventController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"EventQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new EventController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/events/:season/:round',
            ...(fetchMiddlewares<RequestHandler>(EventController)),
            ...(fetchMiddlewares<RequestHandler>(EventController.prototype.getById)),

            function EventController_getById(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new EventController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/grands-prix',
            ...(fetchMiddlewares<RequestHandler>(GrandPrixController)),
            ...(fetchMiddlewares<RequestHandler>(GrandPrixController.prototype.get)),

            function GrandPrixController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"GrandPrixQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new GrandPrixController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/grands-prix/:id',
            ...(fetchMiddlewares<RequestHandler>(GrandPrixController)),
            ...(fetchMiddlewares<RequestHandler>(GrandPrixController.prototype.getById)),

            function GrandPrixController_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new GrandPrixController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/tyre-manufacturers',
            ...(fetchMiddlewares<RequestHandler>(TyreManufacturerService)),
            ...(fetchMiddlewares<RequestHandler>(TyreManufacturerService.prototype.get)),

            function TyreManufacturerService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PageQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new TyreManufacturerService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/tyre-manufacturers/:id',
            ...(fetchMiddlewares<RequestHandler>(TyreManufacturerService)),
            ...(fetchMiddlewares<RequestHandler>(TyreManufacturerService.prototype.getById)),

            function TyreManufacturerService_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new TyreManufacturerService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/session-entrants',
            ...(fetchMiddlewares<RequestHandler>(SessionEntrantController)),
            ...(fetchMiddlewares<RequestHandler>(SessionEntrantController.prototype.get)),

            function SessionEntrantController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"EntrantQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionEntrantController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/free-practices',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService.prototype.getFreePracticesResults)),

            function FreePracticeResultService_getFreePracticesResults(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"TimedSessionResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeResultService();


              const promise = controller.getFreePracticesResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/free-practices/:season/:round/:session',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService.prototype.getFreePracticeSessionResults)),

            function FreePracticeResultService_getFreePracticeSessionResults(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeResultService();


              const promise = controller.getFreePracticeSessionResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/free-practices/:season/:round/:session/:driverId',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService.prototype.getDriverFreePracticeResult)),

            function FreePracticeResultService_getDriverFreePracticeResult(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeResultService();


              const promise = controller.getDriverFreePracticeResult.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/qualifyings',
            ...(fetchMiddlewares<RequestHandler>(QualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(QualifyingResultService.prototype.getQualifyingsResults)),

            function QualifyingResultService_getQualifyingsResults(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"TimedSessionResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new QualifyingResultService();


              const promise = controller.getQualifyingsResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/qualifyings/:season/:round/:session',
            ...(fetchMiddlewares<RequestHandler>(QualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(QualifyingResultService.prototype.getQualifyingSessionResults)),

            function QualifyingResultService_getQualifyingSessionResults(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new QualifyingResultService();


              const promise = controller.getQualifyingSessionResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/qualifyings/:season/:round/:session/:driverId',
            ...(fetchMiddlewares<RequestHandler>(QualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(QualifyingResultService.prototype.getDriverQualifyingResult)),

            function QualifyingResultService_getDriverQualifyingResult(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new QualifyingResultService();


              const promise = controller.getDriverQualifyingResult.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/results',
            ...(fetchMiddlewares<RequestHandler>(RaceResultService)),
            ...(fetchMiddlewares<RequestHandler>(RaceResultService.prototype.getRacesResults)),

            function RaceResultService_getRacesResults(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"RaceResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RaceResultService();


              const promise = controller.getRacesResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/results/:season/:round/:session',
            ...(fetchMiddlewares<RequestHandler>(RaceResultService)),
            ...(fetchMiddlewares<RequestHandler>(RaceResultService.prototype.getRaceResults)),

            function RaceResultService_getRaceResults(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RaceResultService();


              const promise = controller.getRaceResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/results/:season/:round/:session/:driverId',
            ...(fetchMiddlewares<RequestHandler>(RaceResultService)),
            ...(fetchMiddlewares<RequestHandler>(RaceResultService.prototype.getDriverRaceResult)),

            function RaceResultService_getDriverRaceResult(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RaceResultService();


              const promise = controller.getDriverRaceResult.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/pit-stops',
            ...(fetchMiddlewares<RequestHandler>(PitStopController)),
            ...(fetchMiddlewares<RequestHandler>(PitStopController.prototype.get)),

            function PitStopController_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PitStopQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PitStopController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sessions/:season/:round',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getByEvent)),

            function SessionController_getByEvent(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionController();


              const promise = controller.getByEvent.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sessions/:season/:round/:session',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getById)),

            function SessionController_getById(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionController();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sessions/:season/:round/:session/results',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionResults)),

            function SessionController_getSessionResults(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    fields: {"in":"queries","name":"fields","required":true,"ref":"IncludeQueryParam"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionController();


              const promise = controller.getSessionResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sessions/:season/:round/:session/pit-stops',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionPitStops)),

            function SessionController_getSessionPitStops(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PageQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionController();


              const promise = controller.getSessionPitStops.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sessions/:season/:round/:session/laps',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionLaps)),

            function SessionController_getSessionLaps(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PageQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionController();


              const promise = controller.getSessionLaps.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sessions/:season/:round/:session/fastest-lap',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionFastestLap)),

            function SessionController_getSessionFastestLap(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
                    session: {"in":"path","name":"session","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SessionController();


              const promise = controller.getSessionFastestLap.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/laps',
            ...(fetchMiddlewares<RequestHandler>(LapController)),
            ...(fetchMiddlewares<RequestHandler>(LapController.prototype.getLaps)),

            function LapController_getLaps(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"LapQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LapController();


              const promise = controller.getLaps.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/laps/fastest',
            ...(fetchMiddlewares<RequestHandler>(LapController)),
            ...(fetchMiddlewares<RequestHandler>(LapController.prototype.getFastestLaps)),

            function LapController_getFastestLaps(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"LapQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LapController();


              const promise = controller.getFastestLaps.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            response.status(statusCode || 200)
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'queries':
                    return validationService.ValidateParam(args[key], request.query, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
