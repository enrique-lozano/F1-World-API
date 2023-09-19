import { Route, Tags } from 'tsoa';
import { DbService } from '../services/db.service';

@Route('qualifyings')
@Tags('Qualifyings')
export class QualifyingResultService extends DbService {}
