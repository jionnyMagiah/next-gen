import { extract } from "$lib/utils/extract.svelte";
import { Synced } from "../Synced.svelte";
import type { MaybeGetter } from "../types";
import { createIdentifiers } from "../utils/identifiers.svelte";
import { isHtmlElement } from "../utils/is";

const TRIGGER_KEYS = ["ArrowLeft", "ArrowRight", "Home", "End"];

const identifiers = createIdentifiers("tabs", ["trigger", "content", "trigger-list"]);

export type TabsProps<T extends string = string> = {
	/**
	 * If `true`, the value will be changed whenever a trigger is focused.
	 *
	 * @default true
	 */
	selectWhenFocused?: MaybeGetter<boolean | undefined>;
	/**
	 * If the the trigger selection should loop when navigating with the arrow keys.
	 *
	 * @default true
	 */
	loop?: MaybeGetter<boolean | undefined>;
	/**
	 * The default value for `tabs.value`
	 *
	 * When passing a getter, it will be used as source of truth,
	 * meaning that `tabs.value` only changes when the getter returns a new value.
	 *
	 * If omitted, it will use the first tab as default.
	 *
	 * @default undefined
	 */
	value?: MaybeGetter<T>;
	/**
	 * Called when the `Tabs` instance tries to change the active tab.
	 */
	onValueChange?: (active: T) => void;
};

export class Tabs<T extends string = string> {
	#value: Synced<T>;
	#props!: TabsProps<T>;
	#selectWhenFocused = $derived(extract(this.#props.selectWhenFocused, true));
	#loop = $derived(extract(this.#props.loop, true));

	constructor(props: TabsProps<T> = {}) {
		this.#props = props
		this.#value = new Synced<T>(props.value as T, props.onValueChange);
	}

	/** The current selected tab. */
	get value() {
		return this.#value.current;
	}

	set value(value: T) {
		this.#value.current = value;
	}

	/** The attributes for the list that contains the tab triggers. */
	get triggerList() {
		return {
			[identifiers["trigger-list"]]: "",
			role: "tablist",
		} as const;
	}

	/** Gets the attributes and listeners for a tab trigger. Requires an identifying tab value. */
	getTrigger(value: T) {
		if (this.value === undefined) {
			this.value = value;
		}

		return {
			[identifiers.trigger]: value,
			"data-active": this.value === value ? "" : undefined,
			tabindex: this.value === value ? 0 : -1,
			role: "tab",
			"aria-selected": this.value === value,
			onclick: () => (this.value = value),
			onkeydown: (e: KeyboardEvent) => {
				const el = e.target;
				if (!TRIGGER_KEYS.includes(e.key) || !isHtmlElement(el)) {
					return;
				}

				e.preventDefault();
				const triggerList = el.closest(`[${identifiers["trigger-list"]}]`);
				if (!triggerList) return;

				const triggers = [...triggerList.querySelectorAll(`[${identifiers.trigger}]`)];

				const currIndex = triggers.indexOf(el);
				let next = el as Element | undefined;
				switch (e.key) {
					case "ArrowLeft": {
						next = this.#loop
							? triggers.at(currIndex - 1)
							: triggers.at(Math.max(currIndex - 1, 0));
						break;
					}
					case "ArrowRight": {
						next = this.#loop
							? triggers.at((currIndex + 1) % triggers.length)
							: triggers.at(currIndex + 1);
						break;
					}
					case "Home": {
						next = triggers[0];
						break;
					}
					case "End": {
						next = triggers.at(-1);
						break;
					}
				}

				if (!isHtmlElement(next)) return;
				next.focus();

				if (this.#selectWhenFocused) {
					this.value = next.getAttribute(identifiers.trigger) as T;
				}
			},
		} as const;
	}

	/** Gets the attributes and listeners for the tabs contents. Requires an identifying tab value. */
	getContent(value: T) {
		return {
			[identifiers.content]: "",
			hidden: this.value !== value,
			"data-active": this.value === value ? "" : undefined,
		} as const;
	}
}
