import { BaseException } from './baseexception';

export const UnsupportedExceptionName = 'Common.UnsupportedException';

export enum UnsupportedExceptionCode {
  MANIFEST_NOT_FOUND = 'ManifestNotFound',
  OPERATION_NOT_FOUND = 'OperationInfoNotFound',
  RUNTIME_EXPRESSION = 'RuntimeExpressionInDynamicCall',
  RENDER_MULTIPLE_TRIGGERS = 'RenderMultipleTriggers',
  CONTINUATION_TOKEN = 'ContinuationToken',
  MSI_CONNECTION = 'MsiConnectionPresent',
  INVALID_CONNECTION = 'InvalidConnection',
}

export class UnsupportedException extends BaseException {
  constructor(message: string, code?: UnsupportedExceptionCode, data?: Record<string, any>) {
    super(UnsupportedExceptionName, message, code, data);
  }
}
