import { Injectable, ArgumentMetadata, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseNestedQueryPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (typeof value !== 'object') {
            throw new BadRequestException('Validation failed');
        }

        const parsedValue: any = {};
        for (const key in value) {
            if (key.includes('[') && key.includes(']')) {
                const keys = key.split(/\[|\]/).filter(k => k);
                let current = parsedValue;
                for (let i = 0; i < keys.length; i++) {
                    const subKey = keys[i];
                    if (i === keys.length - 1) {
                        current[subKey] = value[key];
                    } else {
                        current = current[subKey] = current[subKey] || {};
                    }
                }
            } else {
                parsedValue[key] = value[key];
            }
        }
        return parsedValue;
    }
}