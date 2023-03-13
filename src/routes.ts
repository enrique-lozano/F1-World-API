/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CountryService } from './services/countries.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CircuitService } from './services/circuit.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompanyService } from './services/company.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DriverService } from './services/driver.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FreePracticeService } from './services/freePractice.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GrandPrixService } from './services/grandPrix.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LapService } from './services/lap.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PitStopService } from './services/pitStop.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EventService } from './services/event.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TyreManufacturerService } from './services/tyreManufacturer.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EventEntrantService } from './services/eventEntrant.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RaceResultService } from './services/raceResult.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DriverStandingService } from './services/driver-standings.service';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { sprintQualifyingResultService } from './services/sprintQualifyingResults.service';
import type { RequestHandler, Router } from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Country": {
        "dataType": "refObject",
        "properties": {
            "alpha2Code": {"dataType":"string","required":true},
            "alpha3Code": {"dataType":"string","required":true},
            "region": {"dataType":"string","required":true},
            "subregion": {"dataType":"string","required":true},
            "commonName": {"dataType":"string","required":true},
            "officialName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Circuit": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "previousNames": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["RACE"]},{"dataType":"enum","enums":["ROAD"]},{"dataType":"enum","enums":["STREET"]}],"required":true},
            "placeName": {"dataType":"string","required":true},
            "country": {"ref":"Country","required":true},
            "latitude": {"dataType":"double","required":true},
            "longitude": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PageMetadata": {
        "dataType": "refObject",
        "properties": {
            "pageSize": {"dataType":"double","required":true},
            "totalElements": {"dataType":"double","required":true},
            "totalPages": {"dataType":"double","required":true},
            "currentPage": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Company": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "country": {"ref":"Country","required":true},
            "founder": {"dataType":"string"},
            "yearFounded": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "specialty": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["engine"]},{"dataType":"enum","enums":["chassis"]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PhotoSchema": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"}},{"dataType":"nestedObjectLiteral","nestedProperties":{"CC":{"dataType":"double"},"CCType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["BY"]},{"dataType":"enum","enums":["BY-SA"]},{"dataType":"enum","enums":["BY-ND"]},{"dataType":"enum","enums":["BY-NC"]},{"dataType":"enum","enums":["BY-NC-ND"]},{"dataType":"enum","enums":["Public Domain"]}]},"siteURL":{"dataType":"string"},"site":{"dataType":"string"},"author":{"dataType":"string"},"description":{"dataType":"string"},"url":{"dataType":"string"},"embedId":{"dataType":"double"}}}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Driver": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "abbreviation": {"dataType":"string","required":true},
            "permanentNumber": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "gender": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MALE"]},{"dataType":"enum","enums":["FEMALE"]}],"required":true},
            "dateOfBirth": {"dataType":"datetime","required":true},
            "dateOfDeath": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "placeOfBirth": {"dataType":"string","required":true},
            "countryOfBirth": {"ref":"Country","required":true},
            "nationalityCountry": {"ref":"Country","required":true},
            "secondNationalityCountry": {"ref":"Country"},
            "photo": {"ref":"PhotoSchema"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "qualyFormat": {
        "dataType": "refEnum",
        "enums": ["FOUR_LAPS","TWO_SESSION","ONE_SESSION","ONE_LAP","AGGREGATE","KNOCKOUT","ELIMINATION","SPRINT_RACE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GrandPrix": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "fullName": {"dataType":"string","required":true},
            "shortName": {"dataType":"string","required":true},
            "countryId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Event": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "raceDate": {"dataType":"datetime","required":true},
            "name": {"dataType":"string","required":true},
            "scheduledLaps": {"dataType":"double","required":true},
            "qualyFormat": {"ref":"qualyFormat","required":true},
            "posterURL": {"dataType":"string","required":true},
            "year": {"dataType":"double","required":true},
            "round": {"dataType":"double","required":true},
            "circuit": {"ref":"Circuit","required":true},
            "grandPrix": {"ref":"GrandPrix","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SeasonEntrant": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "season": {"dataType":"double","required":true},
            "country": {"ref":"Country","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TyreManufacturer": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "country": {"ref":"Country","required":true},
            "primaryColor": {"dataType":"string","required":true},
            "secondaryColor": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimedSessionResult": {
        "dataType": "refObject",
        "properties": {
            "driver": {"ref":"Driver","required":true},
            "race": {"ref":"Event","required":true},
            "seasonEntrant": {"dataType":"union","subSchemas":[{"ref":"SeasonEntrant"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrantName": {"dataType":"string","required":true},
            "chassisManufacturer": {"ref":"Company","required":true},
            "chassisName": {"dataType":"string","required":true},
            "engineManufacturer": {"ref":"Company","required":true},
            "engineName": {"dataType":"string"},
            "tyreManufacturer": {"ref":"TyreManufacturer","required":true},
            "driverNumber": {"dataType":"double"},
            "note": {"dataType":"string"},
            "pos": {"dataType":"double","required":true},
            "laps": {"dataType":"double"},
            "time": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderDir": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FreePracticesQueryParamsWithEvent": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "orderDir": {"ref":"OrderDir","default":"ASC"},
            "chassisManufacturerId": {"dataType":"string"},
            "engineManufacturerId": {"dataType":"string"},
            "eventId": {"dataType":"string"},
            "year": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "pos": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["chassisManufacturerId","engineManufacturerId","eventId","driverId","pos","time","laps","entrantName","chassisName","engineName","driverNumber","note","seasonEntrantId","tyreManufacturerId"],"default":"eventId"},
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
    "LapTime": {
        "dataType": "refObject",
        "properties": {
            "driver": {"ref":"Driver","required":true},
            "race": {"ref":"Event","required":true},
            "seasonEntrant": {"dataType":"union","subSchemas":[{"ref":"SeasonEntrant"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrantName": {"dataType":"string","required":true},
            "chassisManufacturer": {"ref":"Company","required":true},
            "chassisName": {"dataType":"string","required":true},
            "engineManufacturer": {"ref":"Company","required":true},
            "engineName": {"dataType":"string"},
            "tyreManufacturer": {"ref":"TyreManufacturer","required":true},
            "driverNumber": {"dataType":"double"},
            "note": {"dataType":"string"},
            "pos": {"dataType":"double","required":true},
            "time": {"dataType":"double","required":true},
            "lap": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LapQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "orderDir": {"ref":"OrderDir","default":"ASC"},
            "chassisManufacturerId": {"dataType":"string"},
            "engineManufacturerId": {"dataType":"string"},
            "eventId": {"dataType":"string"},
            "year": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "pos": {"dataType":"double"},
            "lap": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["chassisManufacturerId","engineManufacturerId","eventId","driverId","pos","time","entrantName","chassisName","engineName","driverNumber","note","seasonEntrantId","tyreManufacturerId","lap"],"default":"eventId"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PitStop": {
        "dataType": "refObject",
        "properties": {
            "driver": {"ref":"Driver","required":true},
            "race": {"ref":"Event","required":true},
            "seasonEntrant": {"dataType":"union","subSchemas":[{"ref":"SeasonEntrant"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrantName": {"dataType":"string","required":true},
            "chassisManufacturer": {"ref":"Company","required":true},
            "chassisName": {"dataType":"string","required":true},
            "engineManufacturer": {"ref":"Company","required":true},
            "engineName": {"dataType":"string"},
            "tyreManufacturer": {"ref":"TyreManufacturer","required":true},
            "driverNumber": {"dataType":"double"},
            "note": {"dataType":"string"},
            "pitStopLap": {"dataType":"double","required":true},
            "time": {"dataType":"double","required":true},
            "timeOfDay": {"dataType":"string","required":true},
            "annotation": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PitStopQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "orderDir": {"ref":"OrderDir","default":"ASC"},
            "chassisManufacturerId": {"dataType":"string"},
            "engineManufacturerId": {"dataType":"string"},
            "eventId": {"dataType":"string"},
            "year": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "lap": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["chassisManufacturerId","engineManufacturerId","eventId","driverId","time","entrantName","chassisName","engineName","driverNumber","note","seasonEntrantId","tyreManufacturerId","pitStopLap","timeOfDay","annotation"],"default":"eventId"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "orderDir": {"ref":"OrderDir","default":"ASC"},
            "circuitId": {"dataType":"string"},
            "year": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["id","name","raceDate","scheduledLaps","qualyFormat","posterURL","circuitId","grandPrixId"],"default":"id"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventDriverData": {
        "dataType": "refObject",
        "properties": {
            "driver": {"ref":"Driver","required":true},
            "race": {"ref":"Event","required":true},
            "seasonEntrant": {"dataType":"union","subSchemas":[{"ref":"SeasonEntrant"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrantName": {"dataType":"string","required":true},
            "chassisManufacturer": {"ref":"Company","required":true},
            "chassisName": {"dataType":"string","required":true},
            "engineManufacturer": {"ref":"Company","required":true},
            "engineName": {"dataType":"string"},
            "tyreManufacturer": {"ref":"TyreManufacturer","required":true},
            "driverNumber": {"dataType":"double"},
            "note": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventEntrantQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "orderDir": {"ref":"OrderDir","default":"ASC"},
            "chassisManufacturerId": {"dataType":"string"},
            "engineManufacturerId": {"dataType":"string"},
            "eventId": {"dataType":"string"},
            "year": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "orderBy": {"dataType":"enum","enums":["chassisManufacturerId","engineManufacturerId","eventId","driverId","entrantName","chassisName","engineName","driverNumber","note","seasonEntrantId","tyreManufacturerId"],"default":"eventId"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RaceResult": {
        "dataType": "refObject",
        "properties": {
            "driver": {"ref":"Driver","required":true},
            "race": {"ref":"Event","required":true},
            "seasonEntrant": {"dataType":"union","subSchemas":[{"ref":"SeasonEntrant"},{"dataType":"enum","enums":[null]}],"required":true},
            "entrantName": {"dataType":"string","required":true},
            "chassisManufacturer": {"ref":"Company","required":true},
            "chassisName": {"dataType":"string","required":true},
            "engineManufacturer": {"ref":"Company","required":true},
            "engineName": {"dataType":"string"},
            "tyreManufacturer": {"ref":"TyreManufacturer","required":true},
            "driverNumber": {"dataType":"double"},
            "note": {"dataType":"string"},
            "position": {"dataType":"double","required":true},
            "positionText": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}],"required":true},
            "positionOrder": {"dataType":"double","required":true},
            "laps": {"dataType":"double","required":true},
            "time": {"dataType":"double","required":true},
            "timePenalty": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "gap": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "reasonRetired": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "points": {"dataType":"double","required":true},
            "pointsGained": {"dataType":"double","required":true},
            "pointsCountForWDC": {"dataType":"boolean","required":true},
            "gridPos": {"dataType":"string","required":true},
            "positionsGained": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RaceResultQueryParams": {
        "dataType": "refObject",
        "properties": {
            "pageNo": {"dataType":"double","default":"0"},
            "pageSize": {"dataType":"double","default":"10"},
            "orderDir": {"ref":"OrderDir","default":"ASC"},
            "chassisManufacturerId": {"dataType":"string"},
            "engineManufacturerId": {"dataType":"string"},
            "eventId": {"dataType":"string"},
            "year": {"dataType":"double"},
            "driverId": {"dataType":"string"},
            "gridPos": {"dataType":"string"},
            "positionText": {"dataType":"string"},
            "minPos": {"dataType":"double"},
            "maxPos": {"dataType":"double"},
            "orderBy": {"dataType":"enum","enums":["chassisManufacturerId","engineManufacturerId","eventId","driverId","time","laps","entrantName","chassisName","engineName","driverNumber","note","seasonEntrantId","tyreManufacturerId","gridPos","positionText","positionOrder","position","timePenalty","gap","reasonRetired","points","pointsGained","pointsCountForWDC"],"default":"eventId"},
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
        app.get('/companies/:companyId',
            ...(fetchMiddlewares<RequestHandler>(CompanyService)),
            ...(fetchMiddlewares<RequestHandler>(CompanyService.prototype.getById)),

            function CompanyService_getById(request: any, response: any, next: any) {
            const args = {
                    companyId: {"in":"path","name":"companyId","required":true,"dataType":"string"},
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
        app.get('/drivers',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.get)),

            function DriverService_get(request: any, response: any, next: any) {
            const args = {
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
        app.get('/drivers/:driverId/seasons',
            ...(fetchMiddlewares<RequestHandler>(DriverService)),
            ...(fetchMiddlewares<RequestHandler>(DriverService.prototype.getDriverSeasons)),

            function DriverService_getDriverSeasons(request: any, response: any, next: any) {
            const args = {
                    driverId: {"in":"path","name":"driverId","required":true,"dataType":"string"},
                    from: {"default":"races","in":"query","name":"from","dataType":"union","subSchemas":[{"dataType":"enum","enums":["entrants"]},{"dataType":"enum","enums":["races"]}]},
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
        app.get('/free-practices/:session/results',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeService.prototype.get)),

            function FreePracticeService_get(request: any, response: any, next: any) {
            const args = {
                    session: {"in":"path","name":"session","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["fp1"]},{"dataType":"enum","enums":["fp2"]},{"dataType":"enum","enums":["fp3"]},{"dataType":"enum","enums":["fp4"]},{"dataType":"enum","enums":["warm-up"]}]},
                    filters: {"in":"queries","name":"filters","required":true,"ref":"FreePracticesQueryParamsWithEvent"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new FreePracticeService();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/free-practices/:session/results/:eventId/:driverId',
            ...(fetchMiddlewares<RequestHandler>(FreePracticeService)),
            ...(fetchMiddlewares<RequestHandler>(FreePracticeService.prototype.getDriverSessionResult)),

            function FreePracticeService_getDriverSessionResult(request: any, response: any, next: any) {
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

                const controller = new FreePracticeService();


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
            ...(fetchMiddlewares<RequestHandler>(LapService.prototype.getLaps)),

            function LapService_getLaps(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"LapQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LapService();


              const promise = controller.getLaps.apply(controller, validatedArgs as any);
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
        app.get('/races/fastest-laps/:eventId',
            ...(fetchMiddlewares<RequestHandler>(LapService)),
            ...(fetchMiddlewares<RequestHandler>(LapService.prototype.getEventFastestLap)),

            function LapService_getEventFastestLap(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LapService();


              const promise = controller.getEventFastestLap.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/races/pit-stops',
            ...(fetchMiddlewares<RequestHandler>(PitStopService)),
            ...(fetchMiddlewares<RequestHandler>(PitStopService.prototype.getPitStops)),

            function PitStopService_getPitStops(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"PitStopQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new PitStopService();


              const promise = controller.getPitStops.apply(controller, validatedArgs as any);
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
        app.get('/events/:eventId',
            ...(fetchMiddlewares<RequestHandler>(EventService)),
            ...(fetchMiddlewares<RequestHandler>(EventService.prototype.getById)),

            function EventService_getById(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
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
        app.get('/tyre-manufacturers',
            ...(fetchMiddlewares<RequestHandler>(TyreManufacturerService)),
            ...(fetchMiddlewares<RequestHandler>(TyreManufacturerService.prototype.get)),

            function TyreManufacturerService_get(request: any, response: any, next: any) {
            const args = {
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
        app.get('/event-entrants',
            ...(fetchMiddlewares<RequestHandler>(EventEntrantService)),
            ...(fetchMiddlewares<RequestHandler>(EventEntrantService.prototype.getEventEntrants)),

            function EventEntrantService_getEventEntrants(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"EventEntrantQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new EventEntrantService();


              const promise = controller.getEventEntrants.apply(controller, validatedArgs as any);
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
        app.get('/sprint-qualifyings/results',
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService.prototype.getSprintQualifyingsResults)),

            function sprintQualifyingResultService_getSprintQualifyingsResults(request: any, response: any, next: any) {
            const args = {
                    obj: {"in":"queries","name":"obj","required":true,"ref":"RaceResultQueryParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new sprintQualifyingResultService();


              const promise = controller.getSprintQualifyingsResults.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/sprint-qualifyings/results/:eventId',
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService)),
            ...(fetchMiddlewares<RequestHandler>(sprintQualifyingResultService.prototype.getSprintQualifyingResults)),

            function sprintQualifyingResultService_getSprintQualifyingResults(request: any, response: any, next: any) {
            const args = {
                    eventId: {"in":"path","name":"eventId","required":true,"dataType":"string"},
                    notFoundResponse: {"in":"res","name":"404","required":true,"ref":"ErrorMessage_404_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new sprintQualifyingResultService();


              const promise = controller.getSprintQualifyingResults.apply(controller, validatedArgs as any);
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
