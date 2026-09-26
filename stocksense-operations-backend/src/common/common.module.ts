import { Global, Module } from '@nestjs/common';
import { CorrelationIdContext } from './correlation-id.context';
import { ReferenceGeneratorService } from './reference-generator.service';

@Global()
@Module({
  providers: [CorrelationIdContext, ReferenceGeneratorService],
  exports: [CorrelationIdContext, ReferenceGeneratorService],
})
export class CommonModule {}
