<script>
	import { onMount } from 'svelte';
	import store from './store.js'
	import Video from './Video.svelte';
	let message;
	let messages = [];

	onMount(() => {
		store.subscribe(currentMessage => {
				messages = [...messages, currentMessage];
		})
	})
	
	function onSendMessage() {
		 if (message.length > 0) {
			 store.sendMessage(message);
			 message = "";
		 }
	}
</script>

<h1>Hello Chat</h1>

<Video/>

<input type="text" bind:value={message} on:change={onSendMessage}/>
<button on:click={onSendMessage}>
	Send Message
</button>
{#each messages as message, i}
		<p>{message}</p>
{/each}

<style>
	p {
		color: grey;
	}
</style>