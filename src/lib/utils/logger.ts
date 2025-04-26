import { createLogger, transports, format } from 'winston';
import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import { VITE_AXIOM_DATASET, VITE_AXIOM_TOKEN } from '$env/static/private';

const axiomTransport = new AxiomTransport({
	dataset: VITE_AXIOM_DATASET,
	token: VITE_AXIOM_TOKEN
});

const logger = createLogger({
	level: 'info',
	defaultMeta: { service: 'automated-assessment-feedback-agent' },
	format: format.combine(
		format.errors({ stack: true }), // Captures error stack traces
		format.timestamp(),
		format.json() // Formats logs as JSON for structured logging
	),
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.printf(({ timestamp, level, message, stack }) => {
					// Stack traces will be included in error messages automatically
					return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
				})
			)
		}),
		axiomTransport
	],
	exceptionHandlers: [axiomTransport], // Logs uncaught exceptions
	rejectionHandlers: [axiomTransport] // Logs unhandled promise rejections
});

export default logger;
