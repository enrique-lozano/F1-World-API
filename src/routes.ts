/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CountryService } from './controllers/countries.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CircuitService } from './controllers/circuit.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EventService } from './controllers/event.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompanyService } from './controllers/company.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DriverStandingService } from './controllers/driver-standings.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DriverService } from './controllers/driver.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TyreManufacturerService } from './controllers/tyreManufacturer.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FreePracticeResultService } from './controllers/freePracticeResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GrandPrixService } from './controllers/grandPrix.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LapService } from './controllers/lap.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PitStopService } from './controllers/pitStop.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PreQualifyingResultService } from './controllers/preQualifyingResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { QualifyingResultService } from './controllers/qualifyingResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RaceResultService } from './controllers/raceResult.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { sprintQualifyingResultService } from './controllers/sprintQualifyingResult.controller';
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
    "PageQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
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
    "OrderDir": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"integer","default":"0","validators":{"isInt":{"errorMsg":"The `pageNo` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageNo` should be 0","value":0}}},
            "pageSize": {"dataType":"integer","default":"10","validators":{"isInt":{"errorMsg":"The `pageSize` param should be an integer"},"minimum":{"errorMsg":"The minimum value of `pageSize` should be 1","value":1}}},
            "orderDir": {"ref":"OrderDir","default":"asc"},
            "circuitId": {"dataType":"string"},
            "orderBy": {"dataType":"enum","enums":["id","name","grandPrixId","circuitId","raceDate","qualyFormat","scheduledLaps","posterURL"],"default":"id"},
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
            "specialty": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["engine"]},{"dataType":"enum","enums":["chassis"]}]},
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
            "name": {"dataType":"string"},
            "nationalityId": {"dataType":"string"},
            "gender": {"ref":"Gender"},
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
    "TimedSessionResultsDTO": {
        "dataType": "refObject",
        "properties": {
            "positionOrder": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "positionText": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "laps": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "event": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
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
            "orderDir": {"ref":"OrderDir","default":"asc"},
            "minPos": {"dataType":"double"},
            "maxPos": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "positionText": {"dataType":"string"},
            "orderBy": {"dataType":"enum","enums":["entrantId","eventId","positionOrder","positionText","time","laps"],"default":"eventId"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorMessage_404_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"enum","enums":[404],"required":true},
            "code": {"dataType":"string","required":true},
            "details": {"dataType":"string","required":true},
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
    "LapTimeDTO": {
        "dataType": "refObject",
        "properties": {
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "lap": {"dataType":"double","required":true},
            "pos": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "event": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
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
            "orderDir": {"ref":"OrderDir","default":"asc"},
            "pos": {"dataType":"double"},
            "lap": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["entrantId","eventId","time","lap","pos"],"default":"eventId"},
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
            "event": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
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
            "orderDir": {"ref":"OrderDir","default":"asc"},
            "lap": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["entrantId","eventId","time","lap","timeOfDay","annotation"],"default":"\"eventId\""},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RaceResultDTO": {
        "dataType": "refObject",
        "properties": {
            "points": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "positionOrder": {"dataType":"double","required":true},
            "positionText": {"dataType":"string","required":true},
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "gridPosition": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "gridPenalty": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "laps": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "pointsCountForWDC": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "pointsGained": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "gap": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "timePenalty": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "reasonRetired": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "event": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
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
            "orderDir": {"ref":"OrderDir","default":"asc"},
            "minPos": {"dataType":"double"},
            "maxPos": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "gridPos": {"dataType":"string"},
            "positionText": {"dataType":"string"},
            "orderBy": {"dataType":"enum","enums":["points","entrantId","eventId","positionOrder","positionText","time","gridPosition","gridPenalty","laps","pointsCountForWDC","pointsGained","gap","timePenalty","reasonRetired"],"default":"eventId"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SprintQualifyingResultDTO": {
        "dataType": "refObject",
        "properties": {
            "points": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "positionOrder": {"dataType":"double","required":true},
            "positionText": {"dataType":"string","required":true},
            "time": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "laps": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "gap": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "timePenalty": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "reasonRetired": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "gridPos": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "event": {"dataType":"union","subSchemas":[{"ref":"EventDTO"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrant": {"dataType":"union","subSchemas":[{"ref":"EventEntrantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
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
            ...(fetchMiddlewares<RequestHandler>(CountryService)),
            ...(fetchMiddlewares<RequestHandler>(CountryService.prototype.get)),

            function CountryService_get(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CountryService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/countries/:countryId',
            ...(fetchMiddlewares<RequestHandler>(CountryService)),
            ...(fetchMiddlewares<RequestHandler>(CountryService.prototype.getById)),

            function CountryService_getById(request: any, response: any, next: any) {
            const args = {
                    countryId: {"in":"path","name":"countryId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CountryService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/circuits',
            ...(fetchMiddlewares<RequestHandler>(CircuitService)),
            ...(fetchMiddlewares<RequestHandler>(CircuitService.prototype.get)),

            function CircuitService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PageQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CircuitService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/circuits/:id',
            ...(fetchMiddlewares<RequestHandler>(CircuitService)),
            ...(fetchMiddlewares<RequestHandler>(CircuitService.prototype.getById)),

            function CircuitService_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CircuitService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/events',
            ...(fetchMiddlewares<RequestHandler>(EventService)),
            ...(fetchMiddlewares<RequestHandler>(EventService.prototype.get)),

            function EventService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"EventQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new EventService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/events/:season/:round',
            ...(fetchMiddlewares<RequestHandler>(EventService)),
            ...(fetchMiddlewares<RequestHandler>(EventService.prototype.getById)),

            function EventService_getById(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"path","name":"round","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new EventService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/companies',
            ...(fetchMiddlewares<RequestHandler>(CompanyService)),
            ...(fetchMiddlewares<RequestHandler>(CompanyService.prototype.get)),

            function CompanyService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"CompanyQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/companies/:id',
            ...(fetchMiddlewares<RequestHandler>(CompanyService)),
            ...(fetchMiddlewares<RequestHandler>(CompanyService.prototype.getById)),

            function CompanyService_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/championships/:season/drivers',
            ...(fetchMiddlewares<RequestHandler>(DriverStandingService)),
            ...(fetchMiddlewares<RequestHandler>(DriverStandingService.prototype.getDriverChampionshipResults)),

            function DriverStandingService_getDriverChampionshipResults(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    round: {"in":"query","name":"round","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverStandingService();


              const promise = controller.getDriverChampionshipResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/championships/:season/drivers/:driverId',
            ...(fetchMiddlewares<RequestHandler>(DriverStandingService)),
            ...(fetchMiddlewares<RequestHandler>(DriverStandingService.prototype.getDriverChampionshipResult)),

            function DriverStandingService_getDriverChampionshipResult(request: any, response: any, next: any) {
            const args = {
                    season: {"in":"path","name":"season","required":true,"dataType":"double"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    round: {"in":"query","name":"round","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverStandingService();


              const promise = controller.getDriverChampionshipResult.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.get)),

            function DriverService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"DriverQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.getById)),

            function DriverService_getById(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId/relationships',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.getDriverFamilyRelationships)),

            function DriverService_getDriverFamilyRelationships(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverService();


              const promise = controller.getDriverFamilyRelationships.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId/seasons',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.getDriverSeasons)),

            function DriverService_getDriverSeasons(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverService();


              const promise = controller.getDriverSeasons.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/drivers/:driverId/championship-results',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.getChampionshipResults)),

            function DriverService_getChampionshipResults(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DriverService();


              const promise = controller.getChampionshipResults.apply(controller, validatedArgs as any);
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
        app.get('/free-practices/:session/results',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService.prototype.getSessionsResults)),

            function FreePracticeResultService_getSessionsResults(request: any, response: any, next: any) {
            const args = {
                    session: {"in":"path","name":"session","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["fp1"]},{"dataType":"enum","enums":["fp2"]},{"dataType":"enum","enums":["fp3"]},{"dataType":"enum","enums":["fp4"]},{"dataType":"enum","enums":["warm-up"]}]},
                    filters: {"in":"queries","name":"filters","required":true,"ref":"TimedSessionResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeResultService();


              const promise = controller.getSessionsResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/free-practices/:session/results/:eventId',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService.prototype.getSessionResults)),

            function FreePracticeResultService_getSessionResults(request: any, response: any, next: any) {
            const args = {
                    session: {"in":"path","name":"session","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["fp1"]},{"dataType":"enum","enums":["fp2"]},{"dataType":"enum","enums":["fp3"]},{"dataType":"enum","enums":["fp4"]},{"dataType":"enum","enums":["warm-up"]}]},
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeResultService();


              const promise = controller.getSessionResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/free-practices/:session/results/:eventId/:driverId',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeResultService.prototype.getDriverSessionResult)),

            function FreePracticeResultService_getDriverSessionResult(request: any, response: any, next: any) {
            const args = {
                    session: {"in":"path","name":"session","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["fp1"]},{"dataType":"enum","enums":["fp2"]},{"dataType":"enum","enums":["fp3"]},{"dataType":"enum","enums":["fp4"]},{"dataType":"enum","enums":["warm-up"]}]},
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeResultService();


              const promise = controller.getDriverSessionResult.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/grands-prix',
            ...(fetchMiddlewares<RequestHandler>(GrandPrixService)),
            ...(fetchMiddlewares<RequestHandler>(GrandPrixService.prototype.get)),

            function GrandPrixService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"GrandPrixQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new GrandPrixService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/grands-prix/:id',
            ...(fetchMiddlewares<RequestHandler>(GrandPrixService)),
            ...(fetchMiddlewares<RequestHandler>(GrandPrixService.prototype.getById)),

            function GrandPrixService_getById(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new GrandPrixService();


              const promise = controller.getById.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/laps',
            ...(fetchMiddlewares<RequestHandler>(LapService)),
            ...(fetchMiddlewares<RequestHandler>(LapService.prototype.get)),

            function LapService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"LapQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LapService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/fastest-laps',
            ...(fetchMiddlewares<RequestHandler>(LapService)),
            ...(fetchMiddlewares<RequestHandler>(LapService.prototype.getFastestLaps)),

            function LapService_getFastestLaps(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"LapQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LapService();


              const promise = controller.getFastestLaps.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/pit-stops',
            ...(fetchMiddlewares<RequestHandler>(PitStopService)),
            ...(fetchMiddlewares<RequestHandler>(PitStopService.prototype.get)),

            function PitStopService_get(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PitStopQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PitStopService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/pre-qualifyings/results',
            ...(fetchMiddlewares<RequestHandler>(PreQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(PreQualifyingResultService.prototype.getPreQualifyingsResults)),

            function PreQualifyingResultService_getPreQualifyingsResults(request: any, response: any, next: any) {
            const args = {
                    filters: {"in":"queries","name":"filters","required":true,"ref":"TimedSessionResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PreQualifyingResultService();


              const promise = controller.getPreQualifyingsResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/pre-qualifyings/results/:eventId',
            ...(fetchMiddlewares<RequestHandler>(PreQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(PreQualifyingResultService.prototype.getSessionResults)),

            function PreQualifyingResultService_getSessionResults(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PreQualifyingResultService();


              const promise = controller.getSessionResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/pre-qualifyings/results/:eventId/:driverId',
            ...(fetchMiddlewares<RequestHandler>(PreQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(PreQualifyingResultService.prototype.getDriverSessionResult)),

            function PreQualifyingResultService_getDriverSessionResult(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PreQualifyingResultService();


              const promise = controller.getDriverSessionResult.apply(controller, validatedArgs as any);
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
        app.get('/races/results/:eventId',
            ...(fetchMiddlewares<RequestHandler>(RaceResultService)),
            ...(fetchMiddlewares<RequestHandler>(RaceResultService.prototype.getRaceResults)),

            function RaceResultService_getRaceResults(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
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
        app.get('/races/results/:eventId/:driverId',
            ...(fetchMiddlewares<RequestHandler>(RaceResultService)),
            ...(fetchMiddlewares<RequestHandler>(RaceResultService.prototype.getDriverRaceResult)),

            function RaceResultService_getDriverRaceResult(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
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
        app.get('/sprint-qualifyings/results',
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService.prototype.getRacesResults)),

            function sprintQualifyingResultService_getRacesResults(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"RaceResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new sprintQualifyingResultService();


              const promise = controller.getRacesResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sprint-qualifyings/results/:eventId',
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService.prototype.getRaceResults)),

            function sprintQualifyingResultService_getRaceResults(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new sprintQualifyingResultService();


              const promise = controller.getRaceResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sprint-qualifyings/results/:eventId/:driverId',
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService.prototype.getDriverRaceResult)),

            function sprintQualifyingResultService_getDriverRaceResult(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new sprintQualifyingResultService();


              const promise = controller.getDriverRaceResult.apply(controller, validatedArgs as any);
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
