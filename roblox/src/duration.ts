export interface NetDuration {
	totalSeconds: number;
}
export namespace NetDuration {
	export function seconds(totalSeconds: number): NetDuration {
		return { totalSeconds };
	}

	export function minutes(minutes: number): NetDuration {
		return { totalSeconds: minutes * 60 };
	}

	export function hours(hours: number): NetDuration {
		return { totalSeconds: hours * 60 * 60 };
	}

	export function toSeconds(duration: NetDuration): number {
		return duration.totalSeconds;
	}

	export function toMinutes(duration: NetDuration): number {
		return math.floor(duration.totalSeconds / 60);
	}

	export function toHours(duration: NetDuration): number {
		return math.floor(duration.totalSeconds / 60 / 60);
	}
}
